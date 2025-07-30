import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool, Brain, BookOpen, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">WriterAI</span>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 px-6 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-foreground mb-6">
            AI-Powered Writing
            <span className="text-primary"> Assistant</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Accelerate your writing with intelligent character tracking, location management, 
            and timeline organization. Let AI help you craft better stories.
          </p>
          
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-4 h-auto"
          >
            Get Started Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <Brain className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-card-foreground">AI Writing Assistant</CardTitle>
              <CardDescription className="text-muted-foreground">
                Get real-time suggestions for grammar, style, and story development
              </CardDescription>
            </CardHeader>
            <CardContent className="text-card-foreground">
              <ul className="space-y-2 text-sm">
                <li>• Smart synonym suggestions</li>
                <li>• Grammar and style improvements</li>
                <li>• Writing prompts and ideas</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-card-foreground">Story Elements</CardTitle>
              <CardDescription className="text-muted-foreground">
                Automatically track characters, locations, and timeline events
              </CardDescription>
            </CardHeader>
            <CardContent className="text-card-foreground">
              <ul className="space-y-2 text-sm">
                <li>• Character profile management</li>
                <li>• Location and setting details</li>
                <li>• Timeline event tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="text-card-foreground">Auto-Extraction</CardTitle>
              <CardDescription className="text-muted-foreground">
                AI automatically extracts story elements as you write
              </CardDescription>
            </CardHeader>
            <CardContent className="text-card-foreground">
              <ul className="space-y-2 text-sm">
                <li>• Character detection and traits</li>
                <li>• Location identification</li>
                <li>• Significant event capture</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-24 text-center bg-card border border-border rounded-lg p-12">
          <h2 className="text-4xl font-bold text-card-foreground mb-6">
            Ready to Transform Your Writing?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of authors using AI to write better, faster, and more creatively.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-12 py-4 h-auto"
          >
            Start Writing Today
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 WriterAI. Intelligent writing assistance for modern authors.</p>
        </div>
      </footer>
    </div>
  );
}