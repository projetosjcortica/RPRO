import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';

export default function App() {
  return (
    <div className="p-10 space-y-4">
      <h1>Debug Shadcn Components</h1>

      <Button onClick={() => console.log('Button clicked!')}>
        Test Button
      </Button>

      <Input placeholder="Test Input" onChange={e => console.log(e.target.value)} />

      <Card>
        <p>This is a test Card</p>
      </Card>
    </div>
  );
}
