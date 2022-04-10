export enum ErrorCode {
  INTERNAL_SERVER_ERROR = 'internal_server_error',
  NOT_FOUND = 'not_found',
  INCORRECT_USER_ID = 'incorrect_user_id',
  INCORRECT_TEAM_ID = 'incorrect_team_id',
  INCORRECT_TODO_ID = 'incorrect_todo_id',
  NOT_MEMBER = 'not_member', // User isn't a team member
  ALREADY_MEMBER = 'already_member', // User is already a team member
  INCORRECT_CODE = 'incorrect_code', // Incorrect verification code
}
