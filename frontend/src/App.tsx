import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card'
import { Textarea } from './components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { ScrollArea } from './components/ui/scroll-area'
import { Separator } from './components/ui/separator'
import { FileEdit, Send, CheckCircle, ArrowRight } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Question {
  id: number;
  question: string;
}

interface QuestionResponse {
  question_id: number;
  response: string;
}

function App() {
  const [userId] = useState<string>(() => uuidv4());
  
  const [step, setStep] = useState<'intro' | 'interview' | 'preview' | 'complete'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [currentResponse, setCurrentResponse] = useState('');
  const [editedResumeContent, setEditedResumeContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/questions`);
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        setError('获取问题失败，请刷新页面重试');
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  const handleStartInterview = () => {
    setStep('interview');
  };

  const handleSubmitResponse = () => {
    setResponses(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: currentResponse
    }));

    setCurrentResponse('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitAllResponses();
    }
  };

  const handleSubmitAllResponses = async () => {
    setIsLoading(true);
    
    try {
      const formattedResponses: QuestionResponse[] = Object.entries(responses).map(([questionId, response]) => ({
        question_id: parseInt(questionId),
        response
      }));

      if (currentResponse) {
        formattedResponses.push({
          question_id: questions[currentQuestionIndex].id,
          response: currentResponse
        });
      }

      const response = await fetch(`${API_URL}/api/submit-responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          responses: formattedResponses
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit responses');
      }

      const data = await response.json();
      setEditedResumeContent(data.resume_content);
      setStep('preview');
    } catch (error) {
      setError('提交回答失败，请重试');
      console.error('Error submitting responses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateResume = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/resume/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editedResumeContent
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update resume');
      }

      setStep('complete');
    } catch (error) {
      setError('更新简历失败，请重试');
      console.error('Error updating resume:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderIntro = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">AI简历顾问</CardTitle>
        <CardDescription className="text-center">
          通过AI访谈和AI撰写，将普通简历变成内容优质简历
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4">
          <FileEdit className="h-16 w-16 mx-auto text-primary" />
          <p className="mt-4">AI简历顾问将通过一系列问题了解您的经历，然后为您生成优化的简历内容</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleStartInterview}
          disabled={questions.length === 0}
        >
          开始优化简历 <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderInterview = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">AI访谈</CardTitle>
        <CardDescription>
          问题 {currentQuestionIndex + 1}/{questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <p>{questions[currentQuestionIndex]?.question}</p>
        </div>
        <Textarea
          placeholder="请在此输入您的回答..."
          value={currentResponse}
          onChange={(e) => setCurrentResponse(e.target.value)}
          className="min-h-[150px]"
        />
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSubmitResponse}
          disabled={isLoading}
        >
          {isLoading ? '处理中...' : currentQuestionIndex < questions.length - 1 ? '下一题' : '生成简历'}
          {!isLoading && <Send className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderPreview = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">简历预览</CardTitle>
        <CardDescription>
          您可以编辑生成的简历内容
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">预览</TabsTrigger>
            <TabsTrigger value="edit">编辑</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-4">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="whitespace-pre-wrap">
                {editedResumeContent}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="edit" className="mt-4">
            <Textarea
              value={editedResumeContent}
              onChange={(e) => setEditedResumeContent(e.target.value)}
              className="min-h-[400px]"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleUpdateResume}
          disabled={isLoading}
        >
          {isLoading ? '处理中...' : '确认提交'}
        </Button>
      </CardFooter>
    </Card>
  );

  const renderComplete = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">简历优化完成</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
        <p>您的简历已成功优化！</p>
        <Separator />
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="whitespace-pre-wrap text-left">
            {editedResumeContent}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={() => {
            setStep('intro');
            setCurrentQuestionIndex(0);
            setResponses({});
            setCurrentResponse('');
            setEditedResumeContent('');
          }}
        >
          开始新的简历优化
        </Button>
      </CardFooter>
    </Card>
  );

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-xl text-red-500">出错了</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">{error}</p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => window.location.reload()}
            >
              刷新页面
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      {step === 'intro' && renderIntro()}
      {step === 'interview' && renderInterview()}
      {step === 'preview' && renderPreview()}
      {step === 'complete' && renderComplete()}
    </div>
  );
}

export default App
