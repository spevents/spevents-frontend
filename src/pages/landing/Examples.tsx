import { Navigation } from './Navigation';

export function ExamplesPage() {
  return (
    <div className="min-h-screen bg-timberwolf">
      <Navigation />
      
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 text-brunswick-green">
            Success Stories
          </h1>
          
          <div className="space-y-16">
            {[
              {
                title: "Smith-Johnson Wedding",
                venue: "Grand Ballroom, Vanderbilt",
                guests: 250,
                photos: 1200,
                engagement: "92%",
                testimonial: "Our guests loved being able to contribute to our memories without being distracted by their phones."
              },
              {
                title: "Tech Conference 2024",
                venue: "Innovation Center",
                guests: 500,
                photos: 2800,
                engagement: "88%",
                testimonial: "The 3D visualization added an incredible interactive element to our event documentation."
              },
              {
                title: "Cultural Festival",
                venue: "Community Center",
                guests: 350,
                photos: 1800,
                engagement: "95%",
                testimonial: "Spevents made our festival more engaging and memorable for everyone involved."
              }
            ].map((case_, index) => (
              <div 
                key={index} 
                className="grid md:grid-cols-2 gap-8 items-center p-8 rounded-xl bg-white/50 
                  backdrop-blur-sm border border-sage"
              >
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-brunswick-green">
                    {case_.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-sage">Venue</div>
                      <div className="font-medium text-hunter-green">{case_.venue}</div>
                    </div>
                    <div>
                      <div className="text-sm text-sage">Guests</div>
                      <div className="font-medium text-hunter-green">{case_.guests}</div>
                    </div>
                    <div>
                      <div className="text-sm text-sage">Photos Taken</div>
                      <div className="font-medium text-hunter-green">{case_.photos}</div>
                    </div>
                    <div>
                      <div className="text-sm text-sage">Engagement Rate</div>
                      <div className="font-medium text-hunter-green">{case_.engagement}</div>
                    </div>
                  </div>
                  <blockquote className="text-hunter-green italic">
                    "{case_.testimonial}"
                  </blockquote>
                </div>
                <div className="bg-sage/20 aspect-video rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}