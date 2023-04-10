const Sequelize = require('sequelize');
var sequelize = new Sequelize('xfmomulc', 'xfmomulc', '1Yw7T3a8G9JaHNn0At-zGwN8yX5o-kqy', {
  host: 'ruby.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
      ssl: { rejectUnauthorized: false }
  },
  query:{ raw: true }
});

module.exports = sequelize;

const fs = require("fs");

class Data{
    constructor(students, courses){
        this.students = students;
        this.courses = courses;
    }
}


// Define the Student model
const Student = sequelize.define('student', {
  studentNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: Sequelize.STRING,
  },
  lastName: {
    type: Sequelize.STRING,
    
  },
  email: {
    type: Sequelize.STRING,
  },
  addressStreet: {
    type: Sequelize.STRING,
  },
  addressCity: {
    type: Sequelize.STRING,
  },
  addressProvince: {
    type: Sequelize.STRING,
  },
  TA: {
    type: Sequelize.BOOLEAN,
  },
  status: {
    type: Sequelize.STRING,
  },
});


// Define the Course model
const Course = sequelize.define('course', {
  courseId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  courseCode: {
    type: Sequelize.STRING,

  },
  courseDescription: {
    type: Sequelize.STRING,
  },
});

// Define the relationship between Student and Course
Course.hasMany(Student, {foreignKey: 'course'});

let dataCollection = null;

module.exports.initialize = function () {
        return new Promise((resolve, reject) => {
          // sync the database with our models
          sequelize.sync()
            .then(() => {
              console.log('Database synced successfully');
              resolve();
            })
            .catch(error => {
              console.log('Unable to sync the database: ', error);
              reject('Unable to sync the database');
            });
        });
      };
      

module.exports.getAllStudents = function(){
        return new Promise((resolve, reject) => {
          Student.findAll()
            .then((data) => {
              resolve(data);
            })
            .catch((err) => {
              reject("no results returned");
            });
        });
      
};




module.exports.getTAs = function () {
    return new Promise(function (resolve, reject) {
        reject();
    });
};

module.exports.getCourses = function() {
  return new Promise((resolve, reject) => {
    Course.findAll()
      .then(courses => {
        if (courses.length > 0) {
          resolve(courses);
        } else {
          reject("no results returned");
        }
      })
      .catch(error => {
        reject(error.message);
      });
  });
}



module.exports.getStudentByNum = function (num) {
        return new Promise((resolve, reject) => {
          Student.findAll({
            where: { studentNum: num }
          })
            .then((data) => {
              if (data.length > 0) {
                resolve(data[0]);
              } else {
                reject("no results returned");
              }
            })
            .catch((err) => {
              reject(err);
            });
        });
      };

module.exports.getCourseById = function (id) {
  return new Promise((resolve, reject) => {
    Course.findAll({
      where: { id: id }
    })
      .then(data => {
        if (data.length > 0) {
          resolve(data[0]);
        } else {
          reject("No results returned");
        }
      })
      .catch(error => {
        reject(error.message || "No results returned");
      });
  });
};

module.exports.getStudentsByCourse = function (course) {
        return new Promise((resolve, reject) => {
          Course.findByPk(course).then(courseRecord => {
            if (!courseRecord) {
              reject(`Course with ID ${course} not found`);
            } else {
              courseRecord.getStudents().then(students => {
                resolve(students);
              }).catch(err => {
                reject(`Unable to get students for course ${course}: ${err}`);
              });
            }
          }).catch(err => {
            reject(`Unable to find course with ID ${course}: ${err}`);
          });
        });
      
};

module.exports.addStudent = function(studentData) {
        studentData.TA = (studentData.TA) ? true : false;
        
        for (let prop in studentData) {
          if (studentData[prop] === "") {
            studentData[prop] = null;
          }
        }
      
        return new Promise((resolve, reject) => {
          Student.create(studentData)
            .then(() => {
              resolve("Student added successfully");
            })
            .catch((error) => {
              reject("Unable to add student");
            });
        });
      };

      module.exports.getCourses = function (){
        return new Promise((resolve, reject) => {
          Course.findAll()
            .then(function(courses){
              if (courses.length > 0) {
                resolve(courses);
              } else {
                reject('No courses found');
              }
            })
            .catch((error) => {
              reject(`Error retrieving courses: ${error.message}`);
            })
        });
      }
      

module.exports.updateStudent = function(studentData) {
        studentData.TA = (studentData.TA) ? true : false;
        for (const property in studentData) {
          if (studentData[property] === "") {
            studentData[property] = null;
          }
        }
      
        return new Promise((resolve, reject) => {
          Student.update(studentData, {
            where: {
              studentNum: studentData.studentNum
            }
          })
          .then(() => {
            resolve();
          })
          .catch(() => {
            reject("unable to update student");
          });
        });
      }

      
module.exports.addCourse= function(courseData) {
  for (const property in courseData) {
    if (courseData[property] === "") {
      courseData[property] = null;
    }
  }


  return new Promise((resolve, reject) => {
    // Invoke the Course.create() function
    Course.create(courseData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("unable to create course");
      });
  });
}



module.exports.updateCourse= function(courseData) {
  // Replace empty strings with null
  for (const [key, value] of Object.entries(courseData)) {
    if (value === "") {
      courseData[key] = null;
    }
  }

  // Update the course using Course.update()
  return Course.update(
    { courseId: courseData.courseId }, // Filter the operation by courseId
    courseData // Use the modified courseData object
  )
    .then(() => {
      // Resolve the promise if the operation is successful
      return Promise.resolve();
    })
    .catch(() => {
      // Reject the promise if there is an error
      return Promise.reject("Unable to update course");
    });
}

module.exports.deleteCourseById=function(id) {
  return new Promise((resolve, reject) => {
    Course.destroy({ where: { courseId: id } })
      .then(numDeleted => {
        if (numDeleted === 0) {
          reject(new Error(`No course found with id ${id}`));
        } else {
          resolve();
        }
      })
      .catch(err => reject(err));
  });
}
module.exports.deleteStudentByNum=async function(studentNum) {
  try {
    const deletedStudent = await Student.destroy({
      where: {
        studentNum: studentNum,
      },
    });
    if (deletedStudent) {
      return Promise.resolve();
    } else {
      return Promise.reject("Student not found");
    }
  } catch (err) {
    return Promise.reject(err);
  }
}
