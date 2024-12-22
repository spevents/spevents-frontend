import { Navigation } from '../Navigation';
import { Footer } from '../../../components/Footer';
import ExampleShowcase from './ExampleShowcase';

export function ExamplesPage() {
  return (
    <div className="min-h-screen bg-timberwolf">
      <Navigation />
      
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 text-brunswick-green">
            Event Showcase
          </h1>
          
          <ExampleShowcase />
        </div>
      </section>
      
      <Footer />
    </div>
  );
}