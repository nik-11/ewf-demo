import { User } from 'interfaces';
import { FunctionComponent } from 'react';
import { nuid } from './Client';

interface OnlineUsersProps {
  users: User[];
}

const OnlineUsers: FunctionComponent<OnlineUsersProps> = ({ users }) => {
  return (
    <div>
      <h3>Users</h3>
      <div>
        {users.length === 0 && <div>No users online.</div>}
        {users.length > 0 &&
          users.map(({ name, id }, index) => (
            <div key={`user${index}`}>
              {name}
              {id === nuid && <span>&nbsp;(you)</span>}
            </div>
          ))}
      </div>
    </div>
  );
};

export default OnlineUsers;
