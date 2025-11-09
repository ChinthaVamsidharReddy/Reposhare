# Backend API Integration Guide

## Overview
This document outlines all the API endpoints required for the Study Groups Chat Application. The frontend is built with React and expects a Spring Boot backend with MySQL database.

## Base Configuration
- **Backend URL**: `http://localhost:8080` (configurable via `REACT_APP_API_BASE_URL`)
- **WebSocket URL**: `ws://localhost:8080/ws/chat` (configurable via `REACT_APP_WS_URL`)
- **Database**: MySQL
- **Authentication**: JWT Bearer tokens

## Environment Variables (.env)
```
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_WS_URL=ws://localhost:8080/ws/chat
```

## Authentication APIs

### 1. Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**: 
```json
{
  "email": "string",
  "password": "string"
}
```
- **Response**: 
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "STUDENT|TEACHER|ADMIN"
  }
}
```

### 2. Register
- **Endpoint**: `POST /api/auth/register`
- **Request Body**: 
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "STUDENT|TEACHER|ADMIN"
}
```

### 3. Logout
- **Endpoint**: `POST /api/auth/logout`
- **Headers**: `Authorization: Bearer {token}`

## Course APIs

### 1. Get All Courses
- **Endpoint**: `GET /api/courses`
- **Response**: 
```json
[
  {
    "id": "string",
    "code": "string",
    "coursename": "string",
    "description": "string",
    "department": "string"
  }
]
```

## Study Group APIs

### 1. Get User's Created Groups
- **Endpoint**: `GET /api/groups/created/{userId}`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Array of Group objects

### 2. Get User's Joined Groups
- **Endpoint**: `GET /api/groups/joined/{userId}`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Array of Group objects

### 3. Get Available Groups
- **Endpoint**: `GET /api/groups/available/{userId}`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Array of public Group objects user can join

### 4. Create Group
- **Endpoint**: `POST /api/groups`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer {token}`
- **Request Body**: 
```json
{
  "userId": "string",
  "name": "string",
  "description": "string",
  "courseId": "string",
  "privacy": "PUBLIC|PRIVATE",
  "code": "string",
  "coursename": "string"
}
```
- **Response**: Created Group object with generated ID

### 5. Join Group
- **Endpoint**: `POST /api/groups/join/{groupId}?userId={userId}`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Success message or "Request sent" for private groups

### 6. Leave Group
- **Endpoint**: `DELETE /api/groups/leave/{groupId}/{userId}`
- **Headers**: `Authorization: Bearer {token}`

### 7. Delete Group
- **Endpoint**: `DELETE /api/groups/delete/{groupId}/{userId}`
- **Headers**: `Authorization: Bearer {token}`
- **Note**: Only group creator can delete

### 8. Get Group Info
- **Endpoint**: `GET /api/groups/{groupId}`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Group object

### 9. Get Group Members
- **Endpoint**: `GET /api/groups/{groupId}/members`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: 
```json
[
  {
    "userId": "string",
    "userName": "string",
    "userEmail": "string",
    "role": "ADMIN|MEMBER",
    "joinedAt": "datetime"
  }
]
```

## Group Request Management APIs

### 1. Get Join Requests
- **Endpoint**: `GET /api/groups/{groupId}/requests`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: 
```json
[
  {
    "memberId": "string",
    "userName": "string",
    "userMajor": "string",
    "requestedAt": "datetime"
  }
]
```

### 2. Approve Join Request
- **Endpoint**: `POST /api/groups/approve/{memberId}?adminId={userId}`
- **Headers**: `Authorization: Bearer {token}`

### 3. Reject Join Request
- **Endpoint**: `POST /api/groups/reject/{memberId}?adminId={userId}`
- **Headers**: `Authorization: Bearer {token}`

## Chat/Messaging APIs

### 1. Send Message
- **Endpoint**: `POST /api/messages`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer {token}`
- **Request Body**: 
```json
{
  "groupId": "string",
  "senderId": "string",
  "content": "string",
  "type": "text|poll|file|voice",
  "replyTo": {
    "id": "string",
    "content": "string",
    "senderName": "string"
  },
  "poll": {
    "question": "string",
    "options": ["string"],
    "allowMultiple": "boolean",
    "anonymous": "boolean"
  },
  "file": {
    "name": "string",
    "size": "string",
    "type": "string",
    "url": "string"
  },
  "voice": {
    "duration": "string",
    "url": "string"
  }
}
```

### 2. Get Group Messages
- **Endpoint**: `GET /api/groups/{groupId}/messages?page={page}&limit={limit}`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Array of message objects with pagination

### 3. Add Message Reaction
- **Endpoint**: `POST /api/messages/{messageId}/reactions`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer {token}`
- **Request Body**: 
```json
{
  "userId": "string",
  "emoji": "string"
}
```

### 4. Get Unread Count
- **Endpoint**: `GET /api/groups/{groupId}/unread-count/{userId}`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: 
```json
{
  "count": "number"
}
```

### 5. Mark Messages as Read
- **Endpoint**: `POST /api/groups/{groupId}/mark-read`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer {token}`
- **Request Body**: 
```json
{
  "userId": "string",
  "lastReadMessageId": "string"
}
```

## Poll APIs

### 1. Vote on Poll
- **Endpoint**: `POST /api/polls/{pollId}/vote`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer {token}`
- **Request Body**: 
```json
{
  "userId": "string",
  "optionIds": ["number"]
}
```

## Group Settings APIs

### 1. Get Group Settings
- **Endpoint**: `GET /api/groups/{groupId}/settings/{userId}`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: 
```json
{
  "notifications": "boolean",
  "muteNotifications": "boolean",
  "showPreview": "boolean",
  "archived": "boolean"
}
```

### 2. Update Group Settings
- **Endpoint**: `PUT /api/groups/{groupId}/settings/{userId}`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer {token}`
- **Request Body**: 
```json
{
  "notifications": "boolean",
  "muteNotifications": "boolean",
  "showPreview": "boolean",
  "archived": "boolean"
}
```

### 3. Archive Group
- **Endpoint**: `PUT /api/groups/{groupId}/archive`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer {token}`
- **Request Body**: 
```json
{
  "userId": "string",
  "archived": "boolean"
}
```

### 4. Remove Group Member
- **Endpoint**: `DELETE /api/groups/{groupId}/members/{userId}`
- **Headers**: `Authorization: Bearer {token}`

## WebSocket Integration

### Connection
- **URL**: `ws://localhost:8080/ws/chat?userId={userId}`
- **Authentication**: Include JWT token in connection headers

### Message Types

#### 1. Send Message
```json
{
  "type": "message",
  "groupId": "string",
  "message": {
    "id": "string",
    "content": "string",
    "senderId": "string",
    "senderName": "string",
    "timestamp": "datetime",
    "type": "text|poll|file|voice"
  }
}
```

#### 2. Typing Indicator
```json
{
  "type": "typing",
  "groupId": "string",
  "userId": "string",
  "userName": "string"
}
```

#### 3. Stop Typing
```json
{
  "type": "typing_stop",
  "groupId": "string",
  "userId": "string"
}
```

#### 4. Online Users
```json
{
  "type": "online_users",
  "groupId": "string",
  "onlineUser": {
    "userId": "string",
    "userName": "string",
    "lastSeen": "datetime"
  }
}
```

#### 5. Message Reaction
```json
{
  "type": "reaction",
  "groupId": "string",
  "messageId": "string",
  "emoji": "string",
  "userId": "string"
}
```

## Database Schema Suggestions

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('STUDENT', 'TEACHER', 'ADMIN') DEFAULT 'STUDENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Courses Table
```sql
CREATE TABLE courses (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  coursename VARCHAR(255) NOT NULL,
  description TEXT,
  department VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Groups Table
```sql
CREATE TABLE study_groups (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  course_id VARCHAR(255),
  privacy ENUM('PUBLIC', 'PRIVATE') DEFAULT 'PUBLIC',
  code VARCHAR(50),
  coursename VARCHAR(255),
  created_by VARCHAR(255) NOT NULL,
  member_count INT DEFAULT 1,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

### Group Members Table
```sql
CREATE TABLE group_members (
  id VARCHAR(255) PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'MEMBER') DEFAULT 'MEMBER',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_group_user (group_id, user_id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id VARCHAR(255) PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL,
  sender_id VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('text', 'poll', 'file', 'voice') DEFAULT 'text',
  reply_to_id VARCHAR(255),
  status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (reply_to_id) REFERENCES messages(id)
);
```

### Group Settings Table
```sql
CREATE TABLE group_settings (
  id VARCHAR(255) PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  notifications BOOLEAN DEFAULT TRUE,
  mute_notifications BOOLEAN DEFAULT FALSE,
  show_preview BOOLEAN DEFAULT TRUE,
  archived BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_group_user_settings (group_id, user_id)
);
```

## Error Handling
All API endpoints should return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

Error response format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "datetime"
}
```

## Security Considerations
1. All API endpoints require JWT authentication except login/register
2. Validate user permissions for group operations
3. Sanitize all user inputs
4. Implement rate limiting for API calls
5. Use HTTPS in production
6. Validate file uploads and limit file sizes
7. Implement CORS properly for frontend domain

## Notes for Backend Team
1. The frontend currently uses localStorage for demo purposes - replace with actual API calls
2. WebSocket connection is optional - app will work without it but won't have real-time features
3. File upload endpoints need to be implemented for file sharing feature
4. Voice message recording generates blob URLs - implement proper file storage
5. All demo data and localStorage fallbacks should be removed once backend is integrated
6. Frontend expects consistent data structure - follow the response formats exactly
7. Implement proper pagination for message loading
8. Consider implementing message search functionality
9. Add proper logging for debugging
10. Test all endpoints thoroughly before integration
