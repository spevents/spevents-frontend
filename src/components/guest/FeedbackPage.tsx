// src/pages/FeedbackPage.tsx
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="sticky top-0 bg-gray-900/80 backdrop-blur-lg z-10 px-4 py-4 flex items-center">
        <button
          onClick={() => navigate(`/${eventId}/guest`)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white text-xl font-semibold ml-2">Win a Prize!</h1>
      </div>

      <div className="px-6 py-8 max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">
            Want to win a $10 gift card?
          </h2>

          <div className="space-y-4">
            <p className="text-white/80">
              Spevents is an early-stage startup created by a Vanderbilt student (the groom :] ).
              We'd love to hear your thoughts on how we can make this product even better!
            </p>

            <p className="text-white/80">
              Winners will be announced by 1/18/2025
            </p>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">We'd love to know:</h3>
              <ul className="text-white/70 space-y-2">
                <li>• How was your experience using Spevents?</li>
                <li>• What features would you like to see added?</li>
                <li>• Would you recommend this to others?</li>
                <li>• Any suggestions for improvement?</li>
              </ul>
            </div>

            <a
              href="YOUR_GOOGLE_FORM_URL"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white text-gray-900 text-center py-3 rounded-full 
                font-medium hover:bg-white/90 transition-colors"
            >
              Share Your Feedback
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}