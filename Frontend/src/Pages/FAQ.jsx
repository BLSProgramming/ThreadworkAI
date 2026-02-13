import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronDown } from 'react-icons/hi';
import Navbar from '../Components/Navbar';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is Threadwork AI?",
      answer: "Threadwork AI is a multi-model AI platform that allows you to query multiple AI models simultaneously and get a synthesized response. Instead of switching between different AI assistants, you can ask one question and receive insights from several models at once."
    },
    {
      question: "Which AI models does Threadwork support?",
      answer: "We currently support DeepSeek, Llama, GLM-4, Essential, and Moonshot models. Each model brings unique strengths and perspectives to your questions. Our GPT-OSS synthesis engine combines their responses into a single, coherent answer."
    },
    {
      question: "How does the synthesis work?",
      answer: "When you submit a question, we send it to multiple AI models simultaneously. Each model provides its response, which is then processed by our GPT-OSS synthesis engine. The synthesis engine combines the strongest points from each response, resolves any disagreements, and presents you with a clear, actionable answer."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! You can try Threadwork AI directly from our landing page without creating an account. Simply type your question in the 'Try it now' field. For full access to all features and unlimited queries, you'll need to create a free account."
    },
    {
      question: "Do I need to pay for an account?",
      answer: "Threadwork AI offers a free tier that allows you to experience the power of multi-model AI. Premium plans with additional features and higher usage limits are available for power users and teams."
    },
    {
      question: "How is this different from using ChatGPT or Claude directly?",
      answer: "Rather than relying on a single AI model's perspective, Threadwork AI gives you insights from multiple models simultaneously. This helps reduce bias, provides more comprehensive answers, and ensures you're getting the best possible response by leveraging the strengths of different AI architectures."
    },
    {
      question: "Can I see individual model responses?",
      answer: "By default, we show you the synthesized response for clarity and simplicity. However, premium users can access individual model responses to see how each AI approached the question differently."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take security seriously. Your conversations are encrypted in transit and at rest. We don't use your data to train models, and you maintain full ownership of your content. Check our Privacy Policy for complete details."
    },
    {
      question: "How fast are the responses?",
      answer: "Since we query multiple models simultaneously (not sequentially), you typically receive your synthesized answer in just a few seconds—roughly the same time it would take to query a single model."
    },
    {
      question: "Can I use Threadwork AI for my business?",
      answer: "Absolutely! Many businesses use Threadwork AI for research, content creation, problem-solving, and decision-making. We offer team plans with collaboration features, usage analytics, and priority support. Contact us for enterprise pricing."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Purple gradient decorations */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
      
      {/* Navigation */}
      <Navbar />

      {/* FAQ Content */}
      <div className="pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about Threadwork AI
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden hover:bg-gray-100 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <HiChevronDown 
                    className={`w-6 h-6 text-purple-600 flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Need more help?
              </h2>
              <p className="text-gray-600 mb-6">
                Our team is here to assist you with any questions or concerns.
              </p>
              <Link 
                to="/contact" 
                className="inline-block px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-purple-500/25"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
