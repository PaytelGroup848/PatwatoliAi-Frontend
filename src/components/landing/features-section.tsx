import { LineBreaks } from './line-breaks';

type FeaturesSectionProps = {
  model: string[];
  example: string[];
  selectedModel: number;
  selectedExample: number;
  setSelectedModel: (value: number) => void;
  selectExample: (index: number) => void;
  copyStatus: string;
  copyPrompt: () => Promise<void>;
};

export function FeaturesSection({
  model,
  example,
  selectedModel,
  selectedExample,
  setSelectedModel,
  selectExample,
  copyStatus,
  copyPrompt,
}: FeaturesSectionProps) {
  return (
    <>

      <section className="platform section" id="platform">
        <div className="section-heading">
          <div>
            <div className="eyebrow">A CONSTELLATION OF INTELLIGENCE</div>
            <h2>
              The right mind.<br />
              <span>For what’s on yours.</span>
            </h2>
          </div>
          <p>
            Go beyond a single AI conversation.<br />
            Explore specialized models for everyday ideas,<br />
            legal topics, code, health knowledge, and more.
          </p>
        </div>

        <div className="models-grid">
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              className={`model-card ${selectedModel === index ? 'active' : ''}`}
              aria-pressed={selectedModel === index}
              onClick={() => setSelectedModel(index)}
            >
              <span className={`model-icon ${index === 2 ? 'code-icon' : ''}`}>
                {index === 0 ? '✧' : index === 1 ? '⚖' : index === 2 ? '<>' : '＋'}
              </span>
              <small>
                {index === 0
                  ? 'EVERYDAY EXPLORATION'
                  : index === 1
                    ? 'LEGAL EXPLORATION'
                    : index === 2
                      ? 'DEVELOPER INTELLIGENCE'
                      : 'HEALTH EXPLORATION'}
              </small>
              <h3>{index === 0 ? 'General' : index === 1 ? 'LawGPT' : index === 2 ? 'Code Architect' : 'Med Assist'}</h3>
              <p>
                {index === 0
                  ? 'Explore ideas, ask questions, write, and work through your everyday tasks.'
                  : index === 1
                    ? 'Explore legal concepts, structure questions, and approach legal topics with more context.'
                    : index === 2
                      ? 'Think through code, explore technical approaches, and plan your next build.'
                      : 'Explore health terminology and prepare informed questions for a healthcare professional.'}
              </p>
              <span className="model-action">
                Explore {index === 0 ? 'General' : index === 1 ? 'LawGPT' : index === 2 ? 'Code Architect' : 'Med Assist'} <b>↗</b>
              </span>
            </button>
          ))}
        </div>

        <div className="model-console">
          <div className="console-bar">
            <span><i></i> MODEL SPOTLIGHT</span>
            <span>ILLUSTRATIVE EXAMPLE</span>
          </div>
          <div className="console-body">
            <div>
              <span className="console-kicker">{model[0]}</span>
              <h3><LineBreaks text={model[1]} /></h3>
              <p>{model[2]}</p>
              <a className="button" href="/chat">Open Patwatoli AI ↗</a>
            </div>
            <div className="console-sample">
              <div className="sample-prompt">{model[3]}</div>
              <div className="sample-response">
                <span>✳</span>
                <div>
                  <b>{model[4]}</b>
                  <p>{model[5]}</p>
                </div>
              </div>
              <span className="model-note">{model[6]}</span>
            </div>
          </div>
        </div>

        <div className="more-models">
          <span>✳</span>
          <div>
            <b>There’s more intelligence to explore.</b>
            <p>Discover more models inside Patwatoli AI.</p>
          </div>
          <a href="/chat">Explore the platform ↗</a>
        </div>
      </section>

      <section className="possibilities section" id="possibilities">
        <div className="eyebrow">A STARTING POINT FOR ANYTHING</div>
        <h2>What’s on your mind?</h2>
        <p>Different questions. Different expertise. Find a starting point for your next conversation.</p>

        <div className="tabs" role="tablist" aria-label="Example use cases">
          {[0, 1, 2, 3].map((index) => (
            <button key={index} role="tab" aria-selected={selectedExample === index} onClick={() => selectExample(index)}>
              {index === 0 ? '✧ Create & write' : index === 1 ? '◈ Learn & explore' : index === 2 ? '▤ Work with PDFs' : '↗ Plan your day'}
            </button>
          ))}
        </div>

        <div className="example-panel">
          <div>
            <span className="sample-label">A LITTLE INSPIRATION</span>
            <h3><LineBreaks text={example[0]} /></h3>
            <p>{example[1]}</p>
            <a className="textlink" href="/chat">Make it your own <span>↗</span></a>
          </div>
          <div className="prompt-card">
            <span>TRY A PROMPT LIKE THIS</span>
            <blockquote>“{example[2]}”</blockquote>
            <button onClick={copyPrompt}>{copyStatus}</button>
          </div>
        </div>
      </section>

      <section className="steps section" id="how">
        <div className="section-heading">
          <div>
            <div className="eyebrow">FROM CURIOUS TO CREATING</div>
            <h2>
              Make your next move.<br />
              <span>It starts with a question.</span>
            </h2>
          </div>
          <a className="button" href="/chat">Open Patwatoli AI ↗</a>
        </div>

        <div className="steps-grid">
          <article>
            <span>01</span>
            <h3>Bring your curiosity</h3>
            <p>A question, a document, a rough idea. You don’t need a perfect prompt to get started.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Explore together</h3>
            <p>Add context, ask follow-up questions, and find the direction that works for you.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Make it yours</h3>
            <p>Review the response, refine the details, and take your next step with a clearer starting point.</p>
          </article>
        </div>
      </section>
    </>
  );
}
