import Client from './Client';
import { Button } from 'ui';
import { useState } from 'react';

const App = () => {
  const [showClient, setShowClient] = useState<boolean>(false);

  const handleClick = () => {
    setShowClient(!showClient);
  };

  return (
    <div className="App">
      <Button onClick={handleClick} />
      {showClient && <Client />}
    </div>
  );
};

export default App;
