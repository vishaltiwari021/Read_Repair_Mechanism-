import { skillCards } from "../constants/content.js";

function HighlightsSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="skills">
      {skillCards.map((skill) => (
        <div key={skill.title} className="card bg-base-200 border border-base-300 hover:shadow-lg transition-all duration-300 group">
          <div className="card-body p-6">
            <div className="flex justify-between items-end mb-2">
              <h3 className="font-bold text-lg">{skill.title}</h3>
              <span className="text-2xl font-black text-base-content/20 group-hover:text-primary transition-colors">{skill.score}%</span>
            </div>
            <p className="text-sm text-base-content/60 mb-4">{skill.level}</p>
            <progress 
              className="progress progress-primary w-full h-2" 
              value={skill.score} 
              max="100"
            ></progress>
          </div>
        </div>
      ))}
    </section>
  );
}

export default HighlightsSection;
