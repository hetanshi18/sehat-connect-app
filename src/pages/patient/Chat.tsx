import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { mockDoctors } from '@/lib/mockData';

interface Message {
  id: string;
  sender: 'patient' | 'doctor';
  text: string;
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const doctor = mockDoctors.find(d => d.id === doctorId);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'doctor', text: 'Hello! How can I help you today?', timestamp: new Date(Date.now() - 60000) },
    { id: '2', sender: 'patient', text: 'Hi doctor, I have been experiencing headaches and fever.', timestamp: new Date(Date.now() - 30000) },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'patient',
      text: inputText,
      timestamp: new Date(),
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Mock doctor response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        text: 'Thank you for sharing. Let me review your symptoms.',
        timestamp: new Date(),
      }]);
    }, 1000);
  };

  return (
    <DashboardLayout role="patient" title={`Chat with ${doctor?.name || 'Doctor'}`}>
      <div className="max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/consult')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Consultations
        </Button>

        <Card className="flex h-[600px] flex-col shadow-medium">
          {/* Chat Header */}
          <div className="flex items-center gap-3 border-b bg-gradient-primary p-4 text-white rounded-t-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
              {doctor?.name.split(' ')[1][0]}
            </div>
            <div>
              <p className="font-semibold">{doctor?.name}</p>
              <p className="text-xs text-white/80">{doctor?.specialty}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.sender === 'patient'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`mt-1 text-xs ${
                    message.sender === 'patient' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Chat;
