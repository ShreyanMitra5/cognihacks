class FlowService {
  constructor() {
    this.scoreData = [];
    this.trackingInterval = null;
  }

  startTracking(durationMinutes) {
    this.scoreData = [];
    const intervalMinutes = durationMinutes / 10;
    const intervalMs = intervalMinutes * 60 * 1000;

    // Clear any existing interval
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }

    // Start new tracking interval
    this.trackingInterval = setInterval(() => {
      this.fetchFlowScore();
    }, intervalMs);

    // Get initial score
    this.fetchFlowScore();
  }

  stopTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  async fetchFlowScore() {
    try {
      const response = await fetch('https://481606634176.ngrok-free.app/metrics');
      const data = await response.json();
      this.scoreData.push({
        score: data.flow_score,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to fetch flow score:', error);
    }
  }

  getAverageScore() {
    if (this.scoreData.length === 0) return 0;
    const sum = this.scoreData.reduce((acc, data) => acc + data.score, 0);
    const average = (sum / this.scoreData.length) * 100;
    return Math.round(average * 10) / 10; // Round to 1 decimal place
  }

  getScoreData() {
    return this.scoreData;
  }
}
window.FlowService = FlowService;