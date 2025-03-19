import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getProject,
  createTestRun,
  getTestRun,
  addResultForCase,
  TestStatus
} from '../../src/api/testrailApi';

// Mock axios
vi.mock('axios');

describe('testrailApi', () => {
  const options = {
    testRailHost: 'https://example.testrail.com',
    username: 'user',
    apiKey: 'key',
    projectId: 1
  };
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup axios create mock to return axios itself for chaining
    vi.mocked(axios.create).mockReturnValue(axios as any);
  });
  
  describe('getProject', () => {
    it('should fetch project by ID', async () => {
      const mockProject = {
        id: 1,
        name: 'Test Project'
      };
      
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockProject } as any);
      
      const result = await getProject(options);
      
      expect(axios.get).toHaveBeenCalledWith('/get_project/1');
      expect(result).toEqual(mockProject);
    });
  });
  
  describe('createTestRun', () => {
    it('should create a new test run', async () => {
      const payload = {
        name: 'Test Run',
        case_ids: [1, 2, 3]
      };
      
      const mockRun = {
        id: 100,
        name: 'Test Run'
      };
      
      vi.mocked(axios.post).mockResolvedValueOnce({ data: mockRun } as any);
      
      const result = await createTestRun(options, payload as any);
      
      expect(axios.post).toHaveBeenCalledWith('/add_run/1', payload);
      expect(result).toEqual(mockRun);
    });
  });
}); 