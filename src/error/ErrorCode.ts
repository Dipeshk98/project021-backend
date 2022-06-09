export enum ErrorCode {
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  NOT_FOUND = 'not_found',
  INCORRECT_DATA = 'incorrect_data', // The data is corrupted. Bugs in the code? Or potential hacker?
  INCORRECT_USER_ID = 'incorrect_user_id',
  INCORRECT_TEAM_ID = 'incorrect_team_id',
  INCORRECT_TODO_ID = 'incorrect_todo_id',
  INCORRECT_MEMBER_ID = 'incorrect_member_id',
  NOT_MEMBER = 'not_member', // User isn't a team member
  ALREADY_MEMBER = 'already_member', // User is already a team member
  INCORRECT_CODE = 'incorrect_code', // Incorrect verification code
  INCORRECT_STRIPE_SIGNATURE = 'incorrect_stripe_signature', // Incoming webhook error
}
