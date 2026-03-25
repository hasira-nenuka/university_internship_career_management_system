# 🎯 QUICK TEST SCRIPT - Copy & Paste in Browser Console

## ⚡ ONE-LINER TEST (Fastest)
```javascript
fetch('http://localhost:5000/api/company/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({companyName:'TestCo',email:'test'+Date.now()+'@co.com',password:'Pass123456',phone:'+12025551234',address:'123 St',website:'https://test.com',industry:'Tech',companySize:'Large',description:'Test description'})}).then(r=>r.json()).then(d=>console.log(d.success?'✅ SUCCESS':'❌ FAILED',d))
```

## 📋 READABLE TEST (Best for debugging)
```javascript
const testCompanyRegistration = async () => {
    const uniqueEmail = `testco${Date.now()}@gmail.com`;
    
    console.log('🚀 Testing registration with email:', uniqueEmail);
    
    const response = await fetch('http://localhost:5000/api/company/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            companyName: 'Test Company Inc',
            email: uniqueEmail,
            password: 'StrongPass123',
            phone: '+1-202-555-0173',
            address: '456 Business Boulevard',
            website: 'https://testcompany.com',
            industry: 'Information Technology',
            companySize: 'Large',
            description: 'A test company for debugging registration'
        })
    });

    console.log('📊 Status Code:', response.status);
    
    const data = await response.json();
    
    if (data.success) {
        console.log('✅ REGISTRATION SUCCESSFUL!');
        console.log('Company ID:', data.data.id);
        console.log('Company:', data.data.companyName);
    } else {
        console.log('❌ REGISTRATION FAILED');
        console.log('Message:', data.message);
        if (data.errors) console.log('Field Errors:', data.errors);
        if (data.error) console.log('Error Details:', data.error);
    }
    
    return data;
};

testCompanyRegistration();
```

---

## 📍 WHAT TO LOOK FOR

### ✅ SUCCESS Response
```
Status: 201
{
  success: true,
  message: "Company registered successfully",
  data: {
    id: "507f1f77bcf86cd799439011",
    companyName: "Test Company Inc",
    email: "testco1234567890@gmail.com",
    phone: "+1-202-555-0173",
    industry: "Information Technology"
  }
}
```

### ❌ VALIDATION FAILED Response
```
Status: 400
{
  success: false,
  message: "Validation failed",
  errors: {
    email: "Please enter a valid email",
    password: "Password must be at least 6 characters"
  }
}
```

### ❌ DUPLICATE EMAIL Response
```
Status: 400
{
  success: false,
  message: "Company with this email already exists"
}
```

---

## 🔍 BACKEND CONSOLE EXPECTED OUTPUT

When you run the test above, check your backend terminal (`npm start` window) for:

```
📝 Registration Request Received: {
  body: { companyName: '...', email: '...', ... },
  timestamp: '2024-01-15T10:30:45.123Z'
}
✅ Validation passed for email: testco1234567890@gmail.com
✅ Email is unique, creating new company...
✅ Company registered successfully: 507f1f77bcf86cd799439011
```

---

## 🆘 IF YOU SEE AN ERROR

### Error: "Failed to fetch"
- ❌ Backend not running
- ✅ Fix: Open terminal, run `npm start` in backend folder

### Error: "Invalid email"
- ❌ Email format wrong
- ✅ Fix: Use format `name@domain.com`

### Error: "Password must be at least 6 characters"
- ❌ Password too short
- ✅ Fix: Use at least 6 characters

### Error: "Email already exists"
- ❌ Email already used
- ✅ Fix: Use the email generator (`Date.now()` adds unique timestamp)

### Status: 500 (Server Error)
- ❌ Backend bug or MongoDB connection failed
- ✅ Check backend console for error details

---

## 💡 FIELD REQUIREMENTS
| Field | Required | Format | Example |
|-------|----------|--------|---------|
| companyName | ✅ | Text | "Acme Corp" |
| email | ✅ | email@domain.com | "info@acme.com" |
| password | ✅ | 6+ chars | "SecurePass123" |
| phone | ✅ | Digits/symbols | "+1-202-555-0173" |
| address | ✅ | Text | "123 Main St" |
| website | ✅ | Full URL | "https://company.com" |
| industry | ✅ | Text | "Technology" |
| companySize | ✅ | Text | "Large" |
| description | ✅ | Text (5+ chars) | "Leading tech company" |

---

## ✅ STEP-BY-STEP

1. Make sure terminal shows: `✅ MongoDB Connected Successfully`
2. Copy the readable test above
3. Open DevTools (F12) → Console tab
4. Paste the code
5. Hit Enter
6. Look for ✅ SUCCESS or ❌ error
7. If error, check what the error says
8. Fix the issue and retry

