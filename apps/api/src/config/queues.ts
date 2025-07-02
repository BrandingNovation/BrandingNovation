import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { config } from './index.js';

let redis: Redis;
let workflowQueue: Queue;
let emailQueue: Queue;

export async function setupQueues() {
  try {
    redis = new Redis(config.REDIS_URL);
    
    // Initialize queues
    workflowQueue = new Queue('workflow-execution', {
      connection: redis,
    });
    
    emailQueue = new Queue('email-sending', {
      connection: redis,
    });
    
    // Setup workers
    new Worker('workflow-execution', async (job) => {
      console.log('Processing workflow execution:', job.id);
      // TODO: Implement workflow execution logic
    }, {
      connection: redis,
    });
    
    new Worker('email-sending', async (job) => {
      console.log('Processing email:', job.id);
      // TODO: Implement email sending logic
    }, {
      connection: redis,
    });
    
    console.log('Successfully set up job queues');
  } catch (error) {
    console.error('Failed to setup queues:', error);
    throw error;
  }
}

export function getWorkflowQueue() {
  if (!workflowQueue) {
    throw new Error('Workflow queue not initialized. Call setupQueues() first.');
  }
  return workflowQueue;
}

export function getEmailQueue() {
  if (!emailQueue) {
    throw new Error('Email queue not initialized. Call setupQueues() first.');
  }
  return emailQueue;
}