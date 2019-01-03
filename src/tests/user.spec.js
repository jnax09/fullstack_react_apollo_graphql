import { expect } from 'chai'
import * as userApi from './api';

describe('users', () => {
    describe('user(username: String!): User', () => {
        it('returns a user when user can be found', async () => {
          const expectedResult = {
            username: 'rwieruch',
            email: 'hello@robin.com',
            role: 'ADMIN',
          };
            
    
            const result = await userApi.userByUsername({ username: 'rwieruch' });
    
            expect(result.data.data.userByUsername).to.have.own.property('id');
            expect(result.data.data.userByUsername).to.own.include(expectedResult)
        });

        it('returns null when user cannot be found', async () => {
            const expectedResult = {
                userByUsername: null
            };
      
            const result = await userApi.userByUsername({ username: 'lecrae' });
      
            expect(result.data.data.userByUsername).to.be.a('null');
        });
    });
    
    describe('deleteUser(id: String!): Boolean!', () => {
        it('returns an error because only admins can delete a user', async () => {
          const {
            data: {
              data: {
                signIn: { token },
              },
            },
          } = await userApi.signIn({
            login: 'ddavids',
            password: 'ddavids',
          });
    
          const {
            data: { errors },
          } = await userApi.deleteUser({ id: '5c2db4bc3bb4661912bddbbb' }, token);
    
          expect(errors[0].message).to.eql('Not authorized as admin');
        });
      });
})