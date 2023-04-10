const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const exphbs = require("express-handlebars")
const app = express();
const cd = require('./modules/collegeData.js');

app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }));

app.set('views', './views');

app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    layoutsDir: __dirname + "/views/layouts/",
    defaultLayout: 'main',
    helpers: {
      navLink: function(url, options) {
        return '<li' +
          ((url == app.locals.activeRoute) ? ' class="nav-item active"' : ' class="nav-item"') +
          '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
      },

      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    }
    
    }
  }));
app.set("view engine", ".hbs");



app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
    next();
});

app.get("/", (req, res) => {
    res.render("home")
});

app.get("/about", (req, res) => {
    res.render("about")
});
app.get("/users", (req, res) => {
    res.sendFile(__dirname + '/views/users.html');
});


app.post('/students/add', (req, res) => {
  cd.addStudent(req.body)
    .then(() => {
      res.redirect('/students');
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
});

app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo')
});
app.get("/students",(req,res)=>{
  cd.getAllStudents()
  .then((data) => {
    if (data.length > 0) {
      res.render("students", { students: data });
    } else {
      res.render("students", { message: "no results" });
    }
  })
  .catch((error) => {
    res.render("students", { message: error.message });
  });
});



app.get("/courses", (req, res) => {
  cd.getCourses()
    .then((data) => {
      if (data.length > 0) {
        res.render("courses", { courses: data });
      } else {
        res.render("courses", { message: "no results" });
      }
    })
    .catch((error) => {
      res.render("courses", { message: error.message });
    });
});


app.get("/student/:studentNum", (req, res) => {

  let viewData = {};

  cd.getStudentByNum(req.params.studentNum).then((data) => {
      if (data) {
          viewData.student = data; 
      } else {
          viewData.student = null; 
      }
  }).catch(() => {
      viewData.student = null; 
  })
  .then(() => {
    cd.getCourses()
    .then((data) => {
      if (data) {
        viewData.courses = data; 
    } else {

        viewData.courses = null; 
    }

    

      for (let i = 0; i < viewData.courses.length; i++) {
          if (viewData.courses[i].courseId == viewData.student.courseId) {
              viewData.courses[i].selected = true;
          }
      }})

  }).catch(() => {
    console.log("eeror vayo")
      viewData.courses = []; 
  }).then(() => {
      if (viewData.student == null) { 
          res.status(404).send("Student Not Found");
      } else {
          res.render("student", { viewData: viewData }); 
      }
  });
});


app.get('/course/:id', function(req, res) {
  
  var courseId = req.params.id;
  
  
  cd.getCourseById(courseId)
    .then(function(course) {
      
      if (course === undefined) {
        res.status(404).send("Course Not Found");
      }
      else {
        res.render("course", { course: course });
      }
    })
    .catch(function(error) {
     
      res.render('course', { message: error.message });
    });
});

app.post("/student/update", (req, res) => {
  cd.updateStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error updating student");
    });
});
app.get('/courses/add', (req, res) => {

  res.render('addCourse');
});

app.post('/courses/add', async (req, res) => {
  try {
    
    cd.addCourse(req.body);

    
    res.redirect('/courses');
  } catch (error) {
  
    console.error(error);
    res.status(500).send('An error occurred while adding the course.');
  }
});

app.post('/course/update', async (req, res) => {
  try {
    
    cd.updateCourse(req.body);

    
    res.redirect('/courses');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while updating the course.');
  }
});

app.get('/course/delete/:id', function(req, res) {
  var courseId = req.params.id;
  
  cd.deleteCourseById(courseId)
    .then(function() {
      res.redirect('/courses');
    })
    .catch(function(error) {
      res.status(500).send("Unable to Remove Course / Course not found");
    });
});

app.get('/student/delete/:studentNum', (req, res) => {
  const studentNum = req.params.studentNum;
  cd.deleteStudentByNum(studentNum)
    .then(() => {
      res.redirect('/students');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Unable to Remove Student / Student not found');
    });
});

// app.get("/students/add", function(req, res) {
//   cd.getCourses()
//     .then(function(data) {
//       res.render("addStudentForm", {courses: data});
//     })
//     .catch(function(err) {
//       console.log(err);
//       res.render("addStudentForm", {courses: []});
//     });
// });

app.get('*', function(req, res){
    res.status(404).send('PAGE NOT FOUND!!!!');
  });
app.listen(HTTP_PORT, ()=>{console.log("server listening on port: " + HTTP_PORT)
cd.initialize()
});

