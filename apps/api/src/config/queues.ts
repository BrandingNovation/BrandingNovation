import { config } from './index.js';

// Simple in-memory queue for development (no Redis required)
let workflowQueue: any[] = [];
let emailQueue: any[] = [];

export async function setupQueues() {
  try {
    const isDev = config.NODE_ENV === 'development';
    
    if (isDev) {
      // Use simple in-memory queues for development
      console.log('Using in-memory queues for development (no Redis required)');
      
      // Simple queue processor simulation
      setInterval(() => {
        if (workflowQueue.length > 0) {
          const job = workflowQueue.shift();
          console.log('Processing workflow execution:', job?.id);
        }
        if (emailQueue.length > 0) {
          const job = emailQueue.shift();
          console.log('Processing email:', job?.id);
        }
      }, 5000);
      
    } else {
      // For production, use Redis (BullMQ)
      console.log('Queue configuration ready for Redis setup');
      // TODO: Add Redis/BullMQ setup for production
    }
    
    console.log('Successfully set up job queues');
  } catch (error) {
    console.error('Failed to setup queues:', error);
    throw error;
  }
}

export function getWorkflowQueue() {
  return workflowQueue;
}

export function getEmailQueue() {
  return emailQueue;
}

export function addWorkflowJob(job: any) {
  workflowQueue.push({ id: Date.now(), ...job });
  console.log('Added workflow job to queue');
}

export function addEmailJob(job: any) {
  emailQueue.push({ id: Date.now(), ...job });
  console.log('Added email job to queue');
}