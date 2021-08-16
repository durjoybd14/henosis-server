export interface ITask {
    _id?: string;
    taskName: string;
    currentStatus: string;
    dueDate: Date;
    assignedMember: string[];
}

export interface ISprint {
    status: string[];
    tasks: ITask[];
    sprintName: string;
    startDate: Date;
    endDate: Date;
    workspaceId: string;
    goals: string[];
    _id?: string;
}
