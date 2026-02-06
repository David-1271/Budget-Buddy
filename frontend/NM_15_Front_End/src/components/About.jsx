import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <h1>About</h1>

      <section className="course-info">
        <h2>Course Information</h2>
        <p><strong>Course name:</strong> SE/COM S 3190 – Construction of User Interfaces</p>
        <p><strong>Semester:</strong> Fall 2025</p>
      </section>

      <section className="project-info">
        <h2>Project Overview</h2>
        <p>This project is a personal finance management application designed to help users track their income, expenses, budgets, and investments. It provides insights and tools to promote smarter spending and better financial decisions.</p>
      </section>

      

      <section className="team-info">
        <h2>Team Member Information</h2>
        <div className="team-member">
          <h3>David Lawlor</h3>
          <p><strong>Email:</strong> dlawl@iastate.edu</p>
          <p><strong>Role:</strong> Frontend/Backend Development</p>
        </div>
        <div className="team-member">
          <h3>JongwooKim</h3>
          <p><strong>Email:</strong> jwk0425@iastate.edu</p>
          <p><strong>Role:</strong> Documentation + update function.</p>
        </div>
      </section>
      
    </div>
  );
};

export default About;