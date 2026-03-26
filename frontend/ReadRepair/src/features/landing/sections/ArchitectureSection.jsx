import { architectureSteps } from "../constants/content.js";

function ArchitectureSection() {
  return (
    <section className="my-12" id="architecture">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-primary font-bold tracking-wider text-sm uppercase block mb-3">Architecture</span>
        <h2 className="text-4xl font-bold mb-4">How the read repair loop works in your system.</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="w-full lg:w-1/2">
          <ul className="steps steps-vertical lg:steps-vertical">
            {architectureSteps.map((step, index) => (
              <li key={index} className="step step-primary text-left">
                <div className="ml-4 my-2">
                  <h4 className="font-bold text-lg mb-1">Step {`0${index + 1}`}</h4>
                  <p className="text-base-content/70">{step}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full lg:w-1/2 mockup-code bg-neutral text-neutral-content shadow-xl border border-neutral-content/20">
          <div className="px-6 pb-2 text-sm opacity-50 font-bold border-b border-neutral-content/20 mb-4">Repair logic sketch</div>
          <pre data-prefix="1" className="text-success"><code>async function quorumReadRepair(key, replicas) {"{"}</code></pre>
          <pre data-prefix="2"><code>  const reads = await Promise.all(replicas.map(readReplica));</code></pre>
          <pre data-prefix="3"><code>  const latest = reads.sort((a, b) =&gt; b.version - a.version)[0];</code></pre>
          <pre data-prefix="4"><code> </code></pre>
          <pre data-prefix="5" className="text-warning"><code>  await Promise.all(</code></pre>
          <pre data-prefix="6" className="text-warning"><code>    reads.map((item, index) =&gt;</code></pre>
          <pre data-prefix="7" className="text-warning"><code>      item.version &lt; latest.version</code></pre>
          <pre data-prefix="8" className="text-warning"><code>        ? repairReplica(replicas[index], latest)</code></pre>
          <pre data-prefix="9" className="text-warning"><code>        : Promise.resolve()</code></pre>
          <pre data-prefix="10" className="text-warning"><code>    )</code></pre>
          <pre data-prefix="11" className="text-warning"><code>  );</code></pre>
          <pre data-prefix="12"><code> </code></pre>
          <pre data-prefix="13"><code>  return latest.value;</code></pre>
          <pre data-prefix="14" className="text-success"><code>{"}"}</code></pre>
        </div>
      </div>
    </section>
  );
}

export default ArchitectureSection;
