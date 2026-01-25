import sqlite3
import bcrypt

db_path = 'police_cases.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Hash the password
password = 'dortusnimely'
salt = bcrypt.gensalt()
password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

print(f'Password hash: {password_hash}')

# Insert or update user
try:
    cursor.execute('''
        INSERT OR REPLACE INTO users (username, password_hash, role) 
        VALUES (?, ?, ?)
    ''', ('dortusnimely', password_hash, 'admin'))
    
    conn.commit()
    print('✓ Admin user "dortusnimely" created successfully')
    print('✓ Password: dortusnimely')
    print('✓ Role: admin')
except Exception as e:
    print(f'Error: {e}')
finally:
    conn.close()
