import IUser from './userInterface';

export interface IMember extends IUser {
    isCreator?: boolean;
}

interface IWorkspace {
    _id?: string;
    workspaceName: string;
    type: string;
    companyName?: string;
    companyEmail?: string;
    memberEmail?: string;
    members: IMember[];
    previousMails: string[];
}

export default IWorkspace;
