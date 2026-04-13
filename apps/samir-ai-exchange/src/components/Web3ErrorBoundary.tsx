import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class Web3ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("[Web3ErrorBoundary] Caught error:", error.message, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render children anyway — the wallet feature may degrade but the app should work
      return this.props.children;
    }
    return this.props.children;
  }
}
