import React from "react";
import { motion } from "framer-motion";

function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white px-6 py-10 text-gray-800">
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-10 border border-orange-100">

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
          
          {/* Image with animation */}
          <motion.img
            src="https://clearwaterpress.com/oneyearnovel/wp-content/uploads/sites/3/2018/04/icon-student-forum-OYAN-website.png"
            alt="Students Discussion"
            className="w-64 h-40 md:w-72 rounded-2xl shadow-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          />

          {/* Hero Text */}
          <div>
            <h1 className="text-4xl font-extrabold text-orange-600 mb-4">
              About Student Forum
            </h1>
            <p className="text-gray-700 text-lg leading-relaxed">
              Vingo is a collaborative student community platform designed to
              help students learn, share ideas, upload study materials, ask
              doubts, and stay connected with peers across departments.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">

          {/* Mission Section */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">Our Mission</h2>
            <p className="text-gray-700">
              We aim to build an open and helpful digital community where students can
              interact freely, solve academic problems, prepare for exams, and grow together.
            </p>
          </section>
          
          {/* What you can do section with icons */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">
              What You Can Do
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mt-4">
              {/* Card 1 */}
              <div className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4576/4576545.png"
                  alt="Post Ideas"
                  className="w-14 mx-auto mb-3"
                />
                <h3 className="font-semibold text-center">Post Questions</h3>
                <p className="text-sm text-gray-600 text-center">
                  Share academic doubts or discuss ideas with peers.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2972/2972235.png"
                  alt="Upload Resources"
                  className="w-14 mx-auto mb-3"
                />
                <h3 className="font-semibold text-center">Upload Resources</h3>
                <p className="text-sm text-gray-600 text-center">
                  Share PDFs, notes, and images with other students.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
                  alt="AI Help"
                  className="w-14 mx-auto mb-3"
                />
                <h3 className="font-semibold text-center">AI Discussion Room</h3>
                <p className="text-sm text-gray-600 text-center">
                  Ask the AI anything — quick help for coding & studies.
                </p>
              </div>
            </div>
          </section>

          {/* Developer info section */}
          <section>
            <h2 className="text-2xl font-semibold text-orange-500 mb-2">
              Developer Info
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
              
              

              <p className="text-gray-700 text-lg">
                This platform is built with ❤️ using MERN Stack and Gemini AI by
                <span className="font-semibold text-orange-600"> Ganesh Lokhande</span>,
                <span className="font-semibold text-orange-600"> Animesh Anand</span>,
                <span className="font-semibold text-orange-600"> Snehal Raj </span>,
                focused on improving student collaboration and accessibility to academic resources.
              </p>
            </div>
          </section>

        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition"
          >
            ← Back to Home
          </a>
        </div>

      </div>
    </div>
  );
}

export default AboutUs;
