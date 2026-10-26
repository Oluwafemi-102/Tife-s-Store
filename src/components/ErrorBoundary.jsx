import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log the error to your console or an error service
    console.error("ThreeViewer crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI here
      return (
        <div className="p-4 text-center text-gray-500 bg-gray-100 rounded-md">
          <p>3D viewer could not be loaded.</p>
          <p className="text-sm">Your device or browser may not support WebGL.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;