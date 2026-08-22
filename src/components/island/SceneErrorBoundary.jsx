import React from "react";

// Catches intermittent R3F renderer crashes (e.g. the "Cannot read properties
// of undefined (reading 'source')" error that originates inside R3F's applyProps
// reconciler, not in scene code) and recovers by remounting the canvas a few
// times before giving up. This keeps the world usable instead of showing a
// frozen/broken canvas when the renderer hiccups.
export default class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { retryKey: 0, retries: 0, failed: false };
  }

  static getDerivedStateFromError() {
    return { errored: true };
  }

  componentDidCatch(error, errorInfo) {
     
    console.warn("3D scene crashed — attempting remount:", error);
     
    console.warn("React component stack:", errorInfo && errorInfo.componentStack);
    this.setState((s) => {
      if (s.retries >= 3) return { failed: true, lastStack: errorInfo && errorInfo.componentStack };
      return { retryKey: Date.now(), retries: s.retries + 1, errored: false, lastStack: errorInfo && errorInfo.componentStack };
    });
  }

  render() {
    if (this.state.failed) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#1A0B2E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FBF3E0",
            fontFamily: "Poppins, sans-serif",
            textAlign: "center",
            padding: 24,
          }}
        >
          <div>
            <div className="font-caveat" style={{ fontSize: 40, lineHeight: 1 }}>
              The world couldn't load
            </div>
            <p style={{ marginTop: 10, opacity: 0.7, fontSize: 15 }}>
              Please refresh the page.
            </p>
            {this.state.lastStack && (
              <pre
                style={{
                  marginTop: 16,
                  maxWidth: 600,
                  textAlign: "left",
                  fontSize: 11,
                  opacity: 0.6,
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                }}
              >
                {this.state.lastStack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return (
      <div key={this.state.retryKey} style={{ position: "fixed", inset: 0 }}>
        {this.props.children}
      </div>
    );
  }
}