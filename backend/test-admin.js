const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAdminActions() {
  try {
    console.log('Testing admin adoption request actions...');

    // First login as admin
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginResponse = await makeRequest(loginOptions, {
      email: 'admin@gmail.com',
      password: '123456'
    });

    if (loginResponse.statusCode !== 200) {
      throw new Error(`Login failed: ${loginResponse.data.message || loginResponse.data}`);
    }

    const token = loginResponse.data.token;
    console.log('Admin login successful, token:', token ? 'received' : 'not received');

    // Test get adoption requests
    const getOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/adoption',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const getResponse = await makeRequest(getOptions);
    if (getResponse.statusCode !== 200) {
      throw new Error(`Get requests failed: ${getResponse.data.message || getResponse.data}`);
    }

    console.log('Get adoption requests successful, count:', getResponse.data.data.length);

    if (getResponse.data.data.length > 0) {
      const firstRequest = getResponse.data.data[0];
      console.log('First request status:', firstRequest.status);

      // Test approve if pending
      if (firstRequest.status === 'pending') {
        const approveOptions = {
          hostname: 'localhost',
          port: 5000,
          path: `/api/adoption/${firstRequest._id}/approve`,
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const approveResponse = await makeRequest(approveOptions);
        if (approveResponse.statusCode !== 200) {
          throw new Error(`Approve failed: ${approveResponse.data.message || approveResponse.data}`);
        }

        console.log('Approve request successful:', approveResponse.data.message);
      } else {
        console.log('No pending requests to test approve');
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
    if (error.stack) console.error(error.stack);
  }
}

testAdminActions();
