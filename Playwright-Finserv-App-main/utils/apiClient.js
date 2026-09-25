const { request } = require('@playwright/test');

// Per the Combined QA Lab Learner Guide: FinServe API base is <FINSERVE_BASE_URL>/api,
// authenticated with X-API-Key: qa-demo-token-123 (this is the shared training-sandbox key).
const rawApiBaseUrl = process.env.API_BASE_URL || `${process.env.FINSERVE_BASE_URL || 'http://localhost:8082'}/api`;
const API_BASE_URL = rawApiBaseUrl.endsWith('/') ? rawApiBaseUrl : `${rawApiBaseUrl}/`;
const API_KEY = process.env.API_KEY || 'qa-demo-token-123';

class ApiClient {
  constructor() {
    this.context = null;
  }

  async init() {
    if (!this.context) {
      this.context = await request.newContext({
        baseURL: API_BASE_URL,
        extraHTTPHeaders: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json',
        },
      });
    }
    return this.context;
  }

  async get(path, params) {
    const ctx = await this.init();
    return ctx.get(path, { params });
  }

  async post(path, data) {
    const ctx = await this.init();
    return ctx.post(path, { data });
  }

  async put(path, data) {
    const ctx = await this.init();
    return ctx.put(path, { data });
  }

  async delete(path) {
    const ctx = await this.init();
    return ctx.delete(path);
  }

  async dispose() {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }
}

const apiClient = new ApiClient();

module.exports = { ApiClient, apiClient };
