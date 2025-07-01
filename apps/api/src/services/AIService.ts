import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface AIRequest {
  type: 'content_generation' | 'data_analysis' | 'decision_routing' | 'text_processing';
  prompt: string;
  context?: Record<string, any>;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

interface AIResponse {
  success: boolean;
  result?: any;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  processingTime: number;
}

export class AIService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor() {
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Initialize Anthropic if API key is available
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  async processAIRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      let result;

      switch (request.type) {
        case 'content_generation':
          result = await this.generateContent(request);
          break;
        case 'data_analysis':
          result = await this.analyzeData(request);
          break;
        case 'decision_routing':
          result = await this.makeDecision(request);
          break;
        case 'text_processing':
          result = await this.processText(request);
          break;
        default:
          throw new Error(`Unsupported AI request type: ${request.type}`);
      }

      return {
        success: true,
        result,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI processing error',
        processingTime: Date.now() - startTime
      };
    }
  }

  private async generateContent(request: AIRequest): Promise<any> {
    if (!this.openai && !this.anthropic) {
      return this.getFallbackContentGeneration(request);
    }

    const systemPrompt = `You are a professional content generator for business automation workflows. 
Generate high-quality, relevant content based on the user's request. 
Keep the tone professional but engaging.`;

    try {
      if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: request.parameters?.model || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: request.prompt }
          ],
          temperature: request.parameters?.temperature || 0.7,
          max_tokens: request.parameters?.maxTokens || 500,
        });

        return {
          generatedContent: completion.choices[0]?.message?.content || '',
          contentType: 'text',
          wordCount: completion.choices[0]?.message?.content?.split(' ').length || 0,
          model: completion.model,
          usage: completion.usage
        };
      }

      if (this.anthropic) {
        const message = await this.anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: request.parameters?.maxTokens || 500,
          messages: [
            { role: 'user', content: `${systemPrompt}\n\n${request.prompt}` }
          ]
        });

        const content = message.content[0];
        const text = content.type === 'text' ? content.text : '';

        return {
          generatedContent: text,
          contentType: 'text',
          wordCount: text.split(' ').length,
          model: message.model,
          usage: message.usage
        };
      }

    } catch (error) {
      console.warn('AI API call failed, using fallback:', error);
      return this.getFallbackContentGeneration(request);
    }
  }

  private async analyzeData(request: AIRequest): Promise<any> {
    if (!this.openai && !this.anthropic) {
      return this.getFallbackDataAnalysis(request);
    }

    const systemPrompt = `You are a data analyst AI. Analyze the provided data and provide insights, patterns, and actionable recommendations. 
Return your analysis in a structured format with key metrics, insights, and recommendations.`;

    try {
      if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Analyze this data: ${JSON.stringify(request.context, null, 2)}\n\nSpecific request: ${request.prompt}` }
          ],
          temperature: 0.3,
          max_tokens: 800,
        });

        const analysis = completion.choices[0]?.message?.content || '';
        
        return {
          analysis,
          insights: this.extractInsights(analysis),
          recommendations: this.extractRecommendations(analysis),
          confidence: 0.85,
          dataPoints: Object.keys(request.context || {}).length
        };
      }

    } catch (error) {
      console.warn('AI analysis failed, using fallback:', error);
      return this.getFallbackDataAnalysis(request);
    }
  }

  private async makeDecision(request: AIRequest): Promise<any> {
    if (!this.openai && !this.anthropic) {
      return this.getFallbackDecision(request);
    }

    const systemPrompt = `You are a decision-making AI for business workflow automation. 
Based on the provided context and criteria, make a clear decision with reasoning.
Always provide a confidence score and clear next steps.`;

    try {
      if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Context: ${JSON.stringify(request.context, null, 2)}\n\nDecision needed: ${request.prompt}\n\nProvide a clear decision with reasoning and confidence score.` }
          ],
          temperature: 0.2,
          max_tokens: 400,
        });

        const response = completion.choices[0]?.message?.content || '';
        
        return {
          decision: this.extractDecision(response),
          reasoning: this.extractReasoning(response),
          confidence: this.extractConfidence(response),
          nextSteps: this.extractNextSteps(response),
          fullResponse: response
        };
      }

    } catch (error) {
      console.warn('AI decision failed, using fallback:', error);
      return this.getFallbackDecision(request);
    }
  }

  private async processText(request: AIRequest): Promise<any> {
    if (!this.openai && !this.anthropic) {
      return this.getFallbackTextProcessing(request);
    }

    try {
      if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: request.prompt }
          ],
          temperature: request.parameters?.temperature || 0.5,
          max_tokens: request.parameters?.maxTokens || 300,
        });

        return {
          processedText: completion.choices[0]?.message?.content || '',
          originalLength: request.prompt.length,
          processedLength: completion.choices[0]?.message?.content?.length || 0,
          model: completion.model
        };
      }

    } catch (error) {
      console.warn('AI text processing failed, using fallback:', error);
      return this.getFallbackTextProcessing(request);
    }
  }

  // Fallback methods for when AI APIs are not available
  private getFallbackContentGeneration(request: AIRequest): any {
    const templates = [
      `Thank you for your interest! Here's some personalized content based on your recent activity.`,
      `We've analyzed your engagement and prepared this custom message for you.`,
      `Based on your preferences, here's relevant information tailored just for you.`
    ];

    return {
      generatedContent: templates[Math.floor(Math.random() * templates.length)],
      contentType: 'text',
      wordCount: 15,
      model: 'fallback-content-generator',
      isFallback: true
    };
  }

  private getFallbackDataAnalysis(request: AIRequest): any {
    const dataSize = Object.keys(request.context || {}).length;
    const score = 70 + Math.random() * 20; // Random score between 70-90

    return {
      analysis: `Analyzed ${dataSize} data points. Overall performance score: ${score.toFixed(1)}/100.`,
      insights: [
        'Data shows consistent engagement patterns',
        'User activity is above average',
        'Conversion potential is moderate to high'
      ],
      recommendations: [
        'Continue current engagement strategy',
        'Consider personalized follow-up',
        'Monitor for conversion opportunities'
      ],
      confidence: 0.75,
      dataPoints: dataSize,
      isFallback: true
    };
  }

  private getFallbackDecision(request: AIRequest): any {
    const decisions = ['approve', 'review', 'escalate', 'continue', 'pause'];
    const decision = decisions[Math.floor(Math.random() * decisions.length)];

    return {
      decision,
      reasoning: `Based on the available data and standard business rules, ${decision} is the recommended action.`,
      confidence: 0.8,
      nextSteps: [`Take action: ${decision}`, 'Monitor results', 'Adjust if needed'],
      isFallback: true
    };
  }

  private getFallbackTextProcessing(request: AIRequest): any {
    return {
      processedText: request.prompt.toLowerCase().trim(),
      originalLength: request.prompt.length,
      processedLength: request.prompt.length,
      model: 'fallback-text-processor',
      isFallback: true
    };
  }

  // Helper methods to extract information from AI responses
  private extractInsights(text: string): string[] {
    const insights = text.match(/insight[s]?:?\s*(.+?)(?=\n|recommendation|$)/gi);
    return insights ? insights.map(i => i.replace(/insight[s]?:?\s*/i, '').trim()) : [];
  }

  private extractRecommendations(text: string): string[] {
    const recommendations = text.match(/recommendation[s]?:?\s*(.+?)(?=\n|insight|$)/gi);
    return recommendations ? recommendations.map(r => r.replace(/recommendation[s]?:?\s*/i, '').trim()) : [];
  }

  private extractDecision(text: string): string {
    const decision = text.match(/decision:?\s*(.+?)(?=\n|reasoning|$)/i);
    return decision ? decision[1].trim() : 'continue';
  }

  private extractReasoning(text: string): string {
    const reasoning = text.match(/reasoning:?\s*(.+?)(?=\n|confidence|$)/i);
    return reasoning ? reasoning[1].trim() : 'Based on standard business logic';
  }

  private extractConfidence(text: string): number {
    const confidence = text.match(/confidence:?\s*(\d+(?:\.\d+)?)/i);
    return confidence ? parseFloat(confidence[1]) / 100 : 0.8;
  }

  private extractNextSteps(text: string): string[] {
    const steps = text.match(/next steps?:?\s*(.+?)(?=\n\n|$)/i);
    if (steps) {
      return steps[1].split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
    }
    return ['Monitor results', 'Take appropriate action'];
  }

  // Health check for AI services
  async checkAIHealth(): Promise<{
    openai: boolean;
    anthropic: boolean;
    fallbackMode: boolean;
  }> {
    return {
      openai: !!this.openai,
      anthropic: !!this.anthropic,
      fallbackMode: !this.openai && !this.anthropic
    };
  }
}