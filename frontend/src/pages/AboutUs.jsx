import React, { useState } from "react";
import { motion } from "framer-motion";

function AboutUs() {
  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{ backgroundColor: "var(--bg)", color: "var(--text-dark)" }}
    >
      <div
        className="max-w-5xl mx-auto rounded-2xl p-10 shadow-xl fade-in-up"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
          
          {/* Floating Image */}
          <motion.img
            src="https://clearwaterpress.com/oneyearnovel/wp-content/uploads/sites/3/2018/04/icon-student-forum-OYAN-website.png"
            alt="Students"
            className="w-64 h-40 md:w-72 rounded-2xl shadow-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          />

          {/* Hero Text */}
          <div>
            <h1
              className="text-4xl font-extrabold mb-4"
              style={{ color: "var(--color-secondary)" }}
            >
              About Student Forum
            </h1>

            <p className="text-lg leading-relaxed" style={{ color: "var(--text-soft)" }}>
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
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              Our Mission
            </h2>

            <p style={{ color: "var(--text-soft)" }}>
              We aim to build an open and supportive community where students
              can interact freely, solve academic challenges, prepare for exams,
              and grow together.
            </p>
          </section>

          {/* What You Can Do */}
          <section>
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              What You Can Do
            </h2>

            <div className="grid md:grid-cols-3 gap-6 mt-4">
              
              {/* Card 1 */}
              <FeatureCard
                img="https://cdn-icons-png.flaticon.com/512/4576/4576545.png"
                title="Post Questions"
                text="Share academic doubts or start meaningful discussions."
              />

              {/* Card 2 */}
              <FeatureCard
                img="https://cdn-icons-png.flaticon.com/512/2972/2972235.png"
                title="Upload Resources"
                text="Share PDFs, notes, and helpful materials."
              />

              {/* Card 3 */}
              <FeatureCard
                img="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
                title="AI Discussion Room"
                text="Get instant help from AI for coding & academics."
              />

            </div>
          </section>

          {/* Developer / Team */}
          <section>
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              Developer Info
            </h2>

            <p className="text-lg mb-6" style={{ color: "var(--text-soft)" }}>
              This platform is built with ❤️ using MERN Stack + AI to improve
              student collaboration and academic accessibility.
            </p>

            <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--color-secondary)" }}>
              Meet the Team
            </h3>

            <Team />
          </section>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="px-6 py-3 rounded-xl font-medium transition"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "white",
            }}
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

/* ============ Reusable Feature Card ============ */
function FeatureCard({ img, title, text }) {
  return (
    <div
      className="p-5 rounded-xl transition shadow hover:shadow-lg"
      style={{ backgroundColor: "var(--card)" }}
    >
      <img src={img} alt={title} className="w-14 mx-auto mb-3" />

      <h3
        className="font-semibold text-center"
        style={{ color: "var(--color-secondary)" }}
      >
        {title}
      </h3>

      <p
        className="text-sm text-center mt-1"
        style={{ color: "var(--text-soft)" }}
      >
        {text}
      </p>
    </div>
  );
}

/* ============ Team Component ============ */
const Team = () => {
  const [open, setOpen] = useState({});

  const members = [
    {
      id: "ganesh",
      name: "Ganesh Lokhande",
      role: "Full-stack Developer",
      img: "https://i.pravatar.cc/150?u=ganesh",
      bio: "Lead developer focused on backend, APIs, and performance optimization. Passionate about student collaboration tools.",
    },
    {
      id: "animesh",
      name: "Animesh Anand",
      role: "Frontend Developer",
      img: "https://i.pravatar.cc/150?u=animesh",
      bio: "UI/UX enthusiast creating interactive, accessible, and responsive interfaces for students.",
    },
    {
      id: "snehal",
      name: "Snehal Raj",
      role: "AI & Research Engineer",
      img: "https://i.pravatar.cc/150?u=snehal",
      bio: "Works on AI features to help students get automated assistance and smarter content discovery.",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {members.map((m) => (
        <div
          key={m.id}
          className="p-4 rounded-xl shadow transition hover:shadow-lg"
          style={{ backgroundColor: "var(--card)" }}
        >
          <div className="flex items-center gap-3">
            <img src={m.img} alt={m.name} className="w-14 h-14 rounded-full" />
            <div>
              <div className="font-semibold" style={{ color: "var(--color-secondary)" }}>
                {m.name}
              </div>
              <div className="text-sm" style={{ color: "var(--text-soft)" }}>
                {m.role}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-3 text-sm" style={{ color: "var(--text-soft)" }}>
            {open[m.id]
              ? m.bio
              : m.bio.slice(0, 80) + (m.bio.length > 80 ? "..." : "")}
          </div>

          {/* Read More Button */}
          <div className="mt-3 text-right">
            <button
              onClick={() => setOpen((s) => ({ ...s, [m.id]: !s[m.id] }))}
              className="font-medium"
              style={{ color: "var(--color-primary)" }}
            >
              {open[m.id] ? "Show less" : "Read more"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AboutUs;
