
import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg'
import bcrypt from 'bcrypt'
import { spawn } from 'child_process';
import { Salary, bard, job_d, career1 ,resume,news} from './api.js'
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "career",
  password: "Ks@16585",
  port: 5432,
});
db.connect();
let c_id;
const app = express();
const port = 3000;
const saltrounds = 10;


app.use(express.static("public"))
app.use(express.static('views'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render("home.ejs");
});

app.get('/login_page', (req, res) => {
  res.render('login_page.ejs')
});

app.get('/user_Details', (req, res) => {
  res.render("userDetails.ejs");
});

app.get('/job_finder', (req, res) => {
  res.render("job_finder.ejs");
});
app.get('/career', (req, res) => {

  res.render("career.ejs");
});
app.get('/get_resume', (req, res) => {

  res.render("get_resume.ejs");
});

app.get('/entreprenuer', (req, res) => {

  res.render("entreprenuer.ejs");
});
app.get('/entreprenuer', (req, res) => {

  res.render("entreprenuer.ejs");
});
app.get('/skill_details', (req, res) => {

  res.render("skill_details.ejs");
});
app.get('/job_discription', (req, res) => {

  res.render("job_discription.ejs");
});
app.get('/feedback', (req, res) => {

  res.render("feedback.ejs");
});

app.post("/login", async (req, res) => {
  const curr_username = req.body.username;
  const curr_password = req.body.password;
  console.log(`Received username: ${curr_username}`);

  try {
    // Log the query and parameters
    console.log(`Executing query: SELECT * FROM users WHERE username = $1 with parameter ${curr_username}`);
    const auth = await db.query("SELECT * FROM users WHERE username = $1", [curr_username]);
    
    // Log the result of the query
    console.log(`Query result: ${JSON.stringify(auth)}`);

    if (auth.rowCount === 0) {
      // No user found
      console.log('No such user exists');
      res.status(401).send('No such user exists');
      return; // Ensure no further code is executed
    }

    const curr_user = auth.rows[0];
    console.log(`Found user: ${JSON.stringify(curr_user)}`);

    bcrypt.compare(curr_password, curr_user.password_hash, (err, result) => {
      if (err) {
        console.error(`Error during password comparison: ${err}`);
        res.status(500).send('Internal Server Error');
        return; // Ensure no further code is executed
      }

      if (result) {
        console.log('Password match, rendering profile');
        res.render('profile.ejs', { id: curr_user.username });
      } else {
        console.log('Invalid username or password');
        res.status(401).send('Invalid username or password');
      }
    });
  } catch (err) {
    console.error(`Error during database query: ${err}`);
    res.status(500).send('Internal Server Error');
  }
});




app.post('/register', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  try {

    const ifExists = await db.query("select * from users where email = $1", [email])
    if (ifExists.rows.length > 0) {
      res.send("email aready exists")
    }
    else {
      bcrypt.hash(password, saltrounds, async (err, hash) => {

        const auth = await db.query("INSERT INTO users (username, password_hash, email) VALUES ($1, $2,$3) returning *",
          [username, hash, email]);
        const curr_user = auth.rows[0];
        c_id = curr_user.id
      })

    }
  } catch (err) {
    console.log(err)
  }
  res.render('job_finder.ejs')
})


app.post('/user_Details', async (req, res) => {
  const skills = req.body.skills;
  const cert = req.body.cert;
  const experience = req.body.experience;
  const education = req.body.education
  try {
    await db.query("INSERT INTO user_skills (user_id, skills) VALUES ($1, $2)",
      [c_id, skills]);
    await db.query("INSERT INTO user_certifications  (user_id,certification_name) VALUES ($1, $2)",
      [c_id, cert]);
    await db.query("INSERT INTO user_work_experience (user_id,employer,job_title,duration ) VALUES ($1,$2,$3,$4)",
      [c_id, 'mac', 'random', experience]);
    await db.query("INSERT INTO user_education (user_id,degree,institution) VALUES ($1, $2,$3)",
      [c_id, education, 'vvce']);
  } catch (err) {
    console.log(err)
  }
  res.render('profile.ejs', { id: c_id })
});


// finding the desired skills 
app.post('/job_finder', async (req, res) => {
  // Extract user skills from request body (assuming it's sent as JSON)
  let user_text = req.body.Details
  const userSkills = await bard(user_text)
 
  // Run Python script with user skills
  await runPythonScript(userSkills)
    .then((result) => {

      res.render('job_finder.ejs', { result })

    })
    .catch((err) => {
      // Handle errors
      console.log(err)
      res.status(500).send(err);
    });

});

// Function to run the Python script with user skills
function runPythonScript(userSkills) {
  return new Promise((resolve, reject) => {
    // Specify the path to your Python script and pass user skills as arguments
    const pythonProcess = spawn('python', ['./ml/recommendation_script.py', userSkills]);

    // Listen for stdout data from the Python script
    pythonProcess.stdout.on('data', (data) => {
      // Handle data received from Python script
      resolve(data.toString());
    });

    // Listen for errors or script termination
    pythonProcess.on('error', (error) => {
      reject(error);
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(`Python process exited with code ${code}`);
      }
    });
  });
}

app.post('/job_discription', async (req, res) => {
  let d_job = req.body.only_job
  const s_range = await Salary(d_job)
  let job_details = await job_d(d_job)

  res.render('job_discription.ejs', { result: s_range.data, job_details })
})

app.post('/career', async (req, res) => {
  let user_interest = req.body.Details
  let user_education = req.body.c_education

  const result = await career1(user_interest, user_education)
  
  res.render('career.ejs', { result })
})
app.post('/get_resume', async(req,res)=>{

 
 const Experience = req.body.Experience;
 const contactDetails = req.body.contactDetails;
 const qualifications = req.body.qualifications;
 const skills = req.body.skills;
 const result =await resume(Experience,contactDetails,qualifications,skills)

 res.render('get_resume.ejs', { output:result  })
})
app.post('/send_resume', async(req,res)=>{

  
})
app.post('/home', async(req,res)=>{
  const data = req.body.username
  const  new_s = news(data);
  res.send(new_s)
})
app.post('/download_pdf', (req, res) => {
  const { output } = req.body;

  const doc = new PDFDocument();
  let filename = 'resume.pdf';
  filename = encodeURIComponent(filename) + '.pdf';

  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
  res.setHeader('Content-type', 'application/pdf');

  doc.pipe(res);

  const lines = output.split('\n');
  lines.forEach(line => {
    doc.text(line);
    doc.moveDown(0.5);
  });

  doc.end();
});


app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});