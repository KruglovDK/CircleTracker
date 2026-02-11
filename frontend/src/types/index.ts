export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Category {
  id: number;
  name: string;
  user_id: string | null;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string | null;
  user_id: string;
  category_id: number | null;
  group_id: number | null;
  is_essential: boolean;
  created_at: string;
}

export interface TransactionCreate {
  amount: number;
  description?: string;
  category_id?: number;
  group_id?: number;
  is_essential?: boolean;
}

export interface Group {
  id: number;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Invite {
  id: number;
  group_id: number;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface CustomItem {
  id: number;
  name: string;
  user_id: string;
  last_category_id: number | null;
}

export interface ApiError {
  detail: string;
}
