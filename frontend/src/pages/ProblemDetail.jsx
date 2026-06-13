import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './ProblemDetail.css';

const LANGUAGES = [
  { id: 'cpp', label: 'C++', monacoLang: 'cpp' },
  { id: 'python', label: 'Python 3', monacoLang: 'python' },
  { id: 'java', label: 'Java', monacoLang: 'java' },
  { id: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
  { id: 'c', label: 'C', monacoLang: 'c' },
];

const DEFAULT_CODE = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Your code here
    
    return 0;
}`,
  python: `import sys
input = sys.stdin.readline

def main():
    # Your code here
    pass

main()`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your code here
    }
}`,
  javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', line => lines.push(line.trim()));
rl.on('close', () => {
    // Your code here
});`,
  c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Your code here
    return 0;
}`,
};

const VerdictBadge = ({ verdict }) => {
  const map = {
    'Accepted': { emoji: '🟢', class: 'verdict-accepted' },
    'Wrong Answer': { emoji: '🔴', class: 'verdict-wrong' },
    'Time Limit Exceeded': { emoji: '🟠', class: 'verdict-tle' },
    'Compilation Error': { emoji: '🛑', class: 'verdict-ce' },
    'Runtime Error': { emoji: '🔵', class: 'verdict-re' },
    'Pending': { emoji: '⏳', class: 'verdict-pending' },
    'Memory Limit Exceeded': { emoji: '💾', class: 'verdict-tle' },
  };
  const v = map[verdict] || { emoji: '❓', class: 'verdict-pending' };
  return (
    <span className={`verdict-badge ${v.class}`}>
      {v.emoji} {verdict}
    </span>
  );
};

export default function ProblemDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(DEFAULT_CODE['cpp']);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('problem');
  const [submissions, setSubmissions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [customInputEnabled, setCustomInputEnabled] = useState(false);
  const [customInputText, setCustomInputText] = useState('');

  useEffect(() => {
    api.get(`/problems/${slug}`)
      .then(res => { setProblem(res.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [slug]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang]);
  };

  const handleRunCode = async () => {
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    setResult(null);
    try {
      const { data } = await api.post('/submissions/run', {
        language,
        code,
        customInput: customInputEnabled ? customInputText : '',
      });
      setResult(data);
    } catch (err) {
      setResult({ success: false, status: 'Internal Error', stderr: err.response?.data?.message || 'Server error' });
    }
    setSubmitting(false);
  };

  const handleSubmitSolution = async () => {
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    setResult(null);
    try {
      const { data } = await api.post('/submissions', {
        problemId: problem._id,
        language,
        code,
      });
      setResult(data);
    } catch (err) {
      setResult({ status: 'Internal Error', stderr: err.response?.data?.message || 'Server error' });
    }
    setSubmitting(false);
  };

  const loadSubmissions = async () => {
    if (!user) return;
    setSubsLoading(true);
    try {
      const { data } = await api.get(`/submissions/me?problemId=${problem._id}`);
      setSubmissions(data);
    } catch (e) {}
    setSubsLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'submissions' && problem) loadSubmissions();
  };

  if (loading) return (
    <div className="page-wrapper loading-center"><div className="spinner spinner-lg" /></div>
  );

  if (!problem) return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="empty-state">
          <h3>Problem not found</h3>
          <p><Link to="/problems">← Back to Problems</Link></p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="problem-detail-page page-wrapper">
      <div className="problem-layout">
        {/* Left Panel */}
        <div className="problem-left">
          {/* Problem Header */}
          <div className="problem-header">
            <Link to="/problems" className="back-link">← Problems</Link>
            <div className="problem-meta">
              <h1 className="problem-title">{problem.title}</h1>
              <div className="problem-info">
                <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>⏱ {problem.timeLimit}s</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>💾 {problem.memoryLimit}MB</span>
                {problem.totalSubmissions > 0 && (
                  <span style={{ color: 'var(--accent-green)', fontSize: 13 }}>
                    ✓ {((problem.acceptedSubmissions / problem.totalSubmissions) * 100).toFixed(1)}% acceptance
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {(problem.tags || []).map(t => <span key={t} className="badge badge-tag">{t}</span>)}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'problem' ? 'active' : ''}`} onClick={() => handleTabChange('problem')}>📄 Problem</button>
            <button className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => handleTabChange('submissions')}>📊 My Submissions</button>
          </div>

          {activeTab === 'problem' && (
            <div className="problem-body animate-fadeIn">
              <div className="problem-description" dangerouslySetInnerHTML={{ __html: markdownToHtml(problem.description) }} />

              {problem.inputFormat && (
                <div className="problem-section">
                  <h3>Input Format</h3>
                  <p>{problem.inputFormat}</p>
                </div>
              )}

              {problem.outputFormat && (
                <div className="problem-section">
                  <h3>Output Format</h3>
                  <p>{problem.outputFormat}</p>
                </div>
              )}

              {problem.constraints && (
                <div className="problem-section">
                  <h3>Constraints</h3>
                  <div className="code-block"><code>{problem.constraints}</code></div>
                </div>
              )}

              {problem.examples?.map((ex, i) => (
                <div key={i} className="example-block">
                  <h3>Example {i + 1}</h3>
                  <div className="example-io">
                    <div className="example-box">
                      <div className="example-label">Input</div>
                      <pre className="example-content">{ex.input}</pre>
                    </div>
                    <div className="example-box">
                      <div className="example-label">Output</div>
                      <pre className="example-content">{ex.output}</pre>
                    </div>
                  </div>
                  {ex.explanation && (
                    <div className="example-explanation">
                      <strong>Explanation:</strong> {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="animate-fadeIn">
              {!user ? (
                <div className="empty-state">
                  <h3>Login to see your submissions</h3>
                  <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Login</Link>
                </div>
              ) : subsLoading ? (
                <div className="loading-center" style={{ minHeight: 200 }}><div className="spinner" /></div>
              ) : submissions.length === 0 ? (
                <div className="empty-state">
                  <h3>No submissions yet</h3>
                  <p>Submit your solution to see it here</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>Time</th><th>Language</th><th>Verdict</th><th>Runtime</th></tr>
                    </thead>
                    <tbody>
                      {submissions.map(s => (
                        <tr key={s._id}>
                          <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleString()}</td>
                          <td><span className="badge badge-tag">{s.language}</span></td>
                          <td><VerdictBadge verdict={s.verdict} /></td>
                          <td style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-secondary)' }}>
                            {s.runtime !== null ? `${s.runtime}ms` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="problem-right">
          {/* Editor Header */}
          <div className="editor-header">
            <div className="lang-selector">
              {LANGUAGES.map(l => (
                <button
                  key={l.id}
                  className={`lang-btn ${language === l.id ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="editor-wrapper">
            <Editor
              height="100%"
              language={LANGUAGES.find(l => l.id === language)?.monacoLang || 'cpp'}
              value={code}
              onChange={(v) => setCode(v || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: '"JetBrains Mono", monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                tabSize: 4,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>

          <div className="submit-area">
            {/* Custom Input Toggle & Textarea */}
            <div className="custom-input-section">
              <label className="custom-input-toggle">
                <input
                  type="checkbox"
                  checked={customInputEnabled}
                  onChange={(e) => setCustomInputEnabled(e.target.checked)}
                />
                <span>Use Custom Input (stdin)</span>
              </label>
              {customInputEnabled && (
                <textarea
                  className="custom-input-textarea font-mono"
                  placeholder="Provide standard input (stdin) for your program..."
                  value={customInputText}
                  onChange={(e) => setCustomInputText(e.target.value)}
                  rows={3}
                />
              )}
            </div>

            <div className="submit-buttons-row">
              <button
                className="btn btn-secondary btn-lg run-btn"
                onClick={handleRunCode}
                disabled={submitting}
                id="run-code-btn"
              >
                {submitting ? <><div className="spinner" /> Running...</> : '▶ Run Code'}
              </button>

              <button
                className="btn btn-success btn-lg submit-btn"
                onClick={handleSubmitSolution}
                disabled={submitting}
                id="submit-code-btn"
              >
                {submitting ? <><div className="spinner" /> Submitting...</> : '▶ Submit Code'}
              </button>
            </div>

            {result && (
              <div className={`result-panel-modern animate-scaleIn result-${(result.status || result.verdict)?.toLowerCase().replace(/ /g, '-') || 'pending'}`}>
                {/* Result Title */}
                <div className="result-title-row">
                  {(result.status === 'Accepted' || result.verdict === 'Accepted') ? (
                    <span className="result-title-text success">✓ Accepted</span>
                  ) : (
                    <span className="result-title-text failure">✗ {result.status || result.verdict}</span>
                  )}
                  <VerdictBadge verdict={result.status || result.verdict} />
                </div>

                {/* Info Grid */}
                <div className="result-info-grid">
                  <div className="result-info-item">
                    <span className="label">Language:</span>
                    <span className="value font-mono">
                      {LANGUAGES.find(l => l.id === language)?.label || language}
                    </span>
                  </div>
                  <div className="result-info-item">
                    <span className="label">Status:</span>
                    <span className="value"><VerdictBadge verdict={result.status || result.verdict} /></span>
                  </div>
                  {(result.passed !== undefined || result.testCasesPassed !== undefined) && (
                    <div className="result-info-item">
                      <span className="label">Passed:</span>
                      <span className="value">
                        {result.passed ?? result.testCasesPassed} / {result.total ?? result.totalTestCases}
                      </span>
                    </div>
                  )}
                  {(result.execution_time || result.executionTime || result.runtime !== null) && (
                    <div className="result-info-item">
                      <span className="label">Execution Time:</span>
                      <span className="value font-mono">
                        {result.execution_time || result.executionTime || (result.runtime !== null ? `${result.runtime} ms` : '—')}
                      </span>
                    </div>
                  )}
                  {result.memory && (
                    <div className="result-info-item">
                      <span className="label">Memory:</span>
                      <span className="value font-mono">
                        {typeof result.memory === 'string'
                          ? result.memory
                          : (result.memory ? `${(result.memory / 1024).toFixed(1)} MB` : '—')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Wrong Answer side-by-side / detail comparison */}
                {(result.status === 'Wrong Answer' || result.verdict === 'Wrong Answer') && result.failedTest && (
                  <div className="result-wrong-answer-diff">
                    <div className="section-title">Test Case {result.failedTest} Failed</div>
                    <div className="divider-dots">──────────</div>
                    <div className="wrong-answer-diff-grid">
                      <div className="diff-box">
                        <div className="diff-label">Expected:</div>
                        <pre className="diff-content">{result.expected}</pre>
                      </div>
                      <div className="diff-box">
                        <div className="diff-label">Received:</div>
                        <pre className="diff-content">{result.received}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compilation Error Block */}
                {(result.status === 'Compilation Error' || result.verdict === 'Compilation Error') && (
                  <div className="result-console-section">
                    <div className="section-title">compile_output:</div>
                    <div className="divider-dashes">------------------------------</div>
                    <pre className="console-pre error-output-text">
                      {result.compile_output || result.errorOutput || 'Compilation Error.'}
                    </pre>
                  </div>
                )}

                {/* Runtime Error / Stderr Block */}
                {(result.status === 'Runtime Error' || result.verdict === 'Runtime Error') && (
                  <div className="result-console-section">
                    <div className="section-title">stderr:</div>
                    <div className="divider-dashes">------------------------------</div>
                    <pre className="console-pre error-output-text">
                      {result.stderr || result.errorOutput || 'Runtime Error.'}
                    </pre>
                  </div>
                )}

                {/* Time Limit Exceeded Block */}
                {(result.status === 'Time Limit Exceeded' || result.verdict === 'Time Limit Exceeded') && (
                  <div className="result-console-section">
                    <div className="section-title">stderr:</div>
                    <div className="divider-dashes">------------------------------</div>
                    <pre className="console-pre error-output-text">
                      Time Limit Exceeded: Process terminated after exceeding maximum CPU time.
                    </pre>
                  </div>
                )}

                {/* Accepted / Clean Stdin Run Output Block */}
                {(result.status === 'Accepted' || result.verdict === 'Accepted') && (
                  <div className="result-console-section">
                    <div className="section-title">Output:</div>
                    <div className="divider-dashes">------------------------------</div>
                    <pre className="console-pre">
                      {result.stdout || 'All test cases passed successfully.'}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple markdown-to-HTML for problem descriptions
function markdownToHtml(md) {
  if (!md) return '';
  return md
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:var(--bg-tertiary);padding:2px 6px;border-radius:4px;font-family:JetBrains Mono;font-size:13px">$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}
