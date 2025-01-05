// backend/scripts/generate-certs.ts
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SSLConfig {
  sslDir: string;
  keyPath: string;
  certPath: string;
  configPath: string;
}

async function ensureDirectoryExists(dir: string): Promise<void> {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

async function writeSSLConfig(configPath: string): Promise<void> {
  const sslConfig = `[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = localhost

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
`;

  await fs.writeFile(configPath, sslConfig, 'utf-8');
  console.log('SSL configuration written successfully');
}

async function generateCertificate(config: SSLConfig): Promise<void> {
  const command = `openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "${config.keyPath}" \
    -out "${config.certPath}" \
    -config "${config.configPath}"`;

  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.warn('OpenSSL warnings:', stderr);
    }
    if (stdout) {
      console.log('OpenSSL output:', stdout);
    }
    console.log('Certificate generated successfully');
  } catch (error) {
    console.error('Failed to generate certificate:', error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    // Setup paths
    const currentDir = process.cwd();
    const config: SSLConfig = {
      sslDir: path.join(currentDir, 'ssl'),
      keyPath: path.join(currentDir, 'ssl', 'key.pem'),
      certPath: path.join(currentDir, 'ssl', 'cert.pem'),
      configPath: path.join(currentDir, 'ssl', 'ssl.conf')
    };

    // Ensure SSL directory exists
    console.log('Creating SSL directory...');
    await ensureDirectoryExists(config.sslDir);

    // Write SSL configuration
    console.log('Writing SSL configuration...');
    await writeSSLConfig(config.configPath);

    // Generate certificate
    console.log('Generating SSL certificate...');
    await generateCertificate(config);

    console.log('SSL certificate generation completed successfully!');
    
    // Log the locations of the generated files
    console.log('\nGenerated files:');
    console.log(`Key: ${config.keyPath}`);
    console.log(`Certificate: ${config.certPath}`);
    console.log(`Config: ${config.configPath}`);
  } catch (error) {
    console.error('Failed to generate SSL certificates:', error);
    process.exit(1);
  }
}

main();