import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

interface CreateActivityInput {
  userId?: unknown;
  teamId?: unknown;
  type?: unknown;
  minutes?: unknown;
}

export async function createActivity(input: CreateActivityInput) {
  const { userId, teamId, type, minutes } = input ?? {};
  if (typeof userId !== 'string' || typeof teamId !== 'string' || typeof type !== 'string' || typeof minutes !== 'number') {
    throw Object.assign(new Error('userId, teamId, type, and minutes are required'), { status: 400 });
  }
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) {
    throw Object.assign(new Error('userId and teamId must be valid ObjectIds'), { status: 400 });
  }
  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) {
    throw Object.assign(new Error('User and team must exist'), { status: 404 });
  }
  return Activity.create({ user: userId, team: teamId, type, minutes, points: minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

interface CreateTeamInput {
  name?: unknown;
  mascot?: unknown;
  members?: unknown;
}

export async function createTeam(input: CreateTeamInput) {
  const { name, mascot, members } = input ?? {};
  if (typeof name !== 'string' || name.trim() === '' || typeof mascot !== 'string' || mascot.trim() === '') {
    throw Object.assign(new Error('name and mascot are required'), { status: 400 });
  }
  const memberIds = members ?? [];
  if (!Array.isArray(memberIds) || memberIds.some((id) => typeof id !== 'string' || !mongoose.isValidObjectId(id))) {
    throw Object.assign(new Error('members must be an array of valid ObjectIds'), { status: 400 });
  }
  return Team.create({ name, mascot, members: memberIds });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1 } },
  ]);
  const teams = await Team.find({ _id: { $in: totals.map((entry) => entry._id) } }).lean();
  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name]));
  return totals.map((entry, index) => ({
    teamName: teamNames.get(entry._id.toString()) ?? 'Unknown team',
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  const activities = await Activity.find({ user: user._id }).lean();
  const activityTypes = [...new Set(activities.map((activity) => activity.type))];
  const workouts = await Workout.find({ focus: { $in: [user.fitnessGoal, ...activityTypes] } }).lean();
  return workouts.map((workout) => ({
    ...workout,
    reason: workout.focus === user.fitnessGoal
      ? `Matches your ${workout.focus} fitness goal`
      : `Matches your recent ${workout.focus} activity`,
  }));
}

export { User };
