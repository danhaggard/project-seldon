UPDATE auth.users 
SET encrypted_password = extensions.crypt('password123', extensions.gen_salt('bf'))
WHERE email = 'admin@seldon.test';