// import React, { useState, useEffect } from "react";
// import { createFaq, getFaq } from '../../../Interceptor/interceptor';

// const FaqAdmin = () => {
//   const [faqs, setFaqs] = useState([]);
//   const [newQuestion, setNewQuestion] = useState("");
//   const [newAnswer, setNewAnswer] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch FAQs on component mount
//   useEffect(() => {
//     const fetchFaqs = async () => {
//       try {
//         const response = await getFaq();
//         setFaqs(response.data || []);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };
//     fetchFaqs();
//   }, []);

//   const handleAddFAQ = async (e) => {
//     e.preventDefault();
//     if (newQuestion.trim() && newAnswer.trim()) {
//       try {
//         const response = await createFaq({
//           question: newQuestion,
//           answer: newAnswer
//         });
//         setFaqs([...faqs, response.data]);
//         setNewQuestion("");
//         setNewAnswer("");
//         setError(null);
//       } catch (err) {
//         setError(err.message);
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-100 py-12 px-6 lg:px-8">
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-3xl font-bold mb-8 text-gray-800">FAQ Management</h2>
//           <p>Loading FAQs...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-100 py-12 px-6 lg:px-8">
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-3xl font-bold mb-8 text-gray-800">FAQ Management</h2>
//           <p className="text-red-500">Error: {error}</p>
//           <button 
//             onClick={() => {
//               setError(null);
//               setLoading(true);
//               // Retry fetching FAQs
//               const fetchFaqs = async () => {
//                 try {
//                   const response = await getFaq();
//                   setFaqs(response.data || []);
//                   setLoading(false);
//                 } catch (err) {
//                   setError(err.message);
//                   setLoading(false);
//                 }
//               };
//               fetchFaqs();
//             }}
//             className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 py-12 px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
//           FAQ Management
//         </h2>

//         {/* Error message */}
//         {error && (
//           <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
//             <p>{error}</p>
//             <button 
//               onClick={() => setError(null)}
//               className="text-red-700 underline mt-2"
//             >
//               Dismiss
//             </button>
//           </div>
//         )}

//         {/* Add FAQ Form */}
//         <div className="bg-white p-6 rounded-lg shadow-md mb-10">
//           <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New FAQ</h3>
//           <form onSubmit={handleAddFAQ} className="space-y-4">
//             <div>
//               <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
//                 Question
//               </label>
//               <input
//                 id="question"
//                 type="text"
//                 placeholder="Enter question"
//                 value={newQuestion}
//                 onChange={(e) => setNewQuestion(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
//                 required
//               />
//             </div>
            
//             <div>
//               <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
//                 Answer
//               </label>
//               <textarea
//                 id="answer"
//                 placeholder="Enter answer"
//                 value={newAnswer}
//                 onChange={(e) => setNewAnswer(e.target.value)}
//                 rows={4}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
//                 required
//               />
//             </div>
            
//             <button
//               type="submit"
//               className="w-full bg-pink-500 text-white px-6 py-3 rounded-md hover:bg-pink-600 transition font-medium"
//               disabled={!newQuestion.trim() || !newAnswer.trim()}
//             >
//               Add FAQ
//             </button>
//           </form>
//         </div>

//         {/* FAQ List */}
//         <div className="space-y-6">
//           <h3 className="text-2xl font-semibold text-gray-800">
//             Existing FAQs ({faqs.length})
//           </h3>
          
//           {faqs.length === 0 ? (
//             <div className="bg-white p-6 rounded-lg shadow text-center">
//               <p className="text-gray-500">No FAQs available. Add your first FAQ above.</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {faqs.map((faq, index) => (
//                 <div key={faq._id || index} className="bg-white p-6 rounded-lg shadow">
//                   <h4 className="font-bold text-lg text-gray-800 mb-2">{faq.question}</h4>
//                   <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FaqAdmin;