interface IUser {
    id: string;
    userId: string;
    workspaceId: string;
}

class User {
    users: IUser[];

    constructor() {
        this.users = [];
    }

    addUser({ id, userId, workspaceId }: IUser): IUser {
        const user = { id, userId, workspaceId };
        this.users.push(user);
        return user;
    }

    getUserList(workspaceId: string): IUser[] {
        const usersList = this.users.filter((user) => user.workspaceId === workspaceId);
        const newList = usersList.filter((user, index, list) => {
            return index === list.findIndex((user2) => user2.userId === user.userId);
        });
        return newList;
    }

    removeUser(id: string): IUser | undefined {
        const currentUser = this.users.find((user) => user.id === id);
        if (currentUser) {
            this.users = this.users.filter((user) => user.id !== id);
        }
        return currentUser;
    }
}

export default User;
