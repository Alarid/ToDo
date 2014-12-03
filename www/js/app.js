// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('todo', ['ionic'])

.factory('Projects', function() {
  return {
    all: function() {
      // window.localStorage['projects'] = [];
      var projectString = window.localStorage['projects'];
      if (projectString) {
        return angular.fromJson(projectString);
      }
      return [];
    },
    save: function(projects) {
      window.localStorage['projects'] = angular.toJson(projects);
    },
    newProject: function(projectTitle) {
      return {
        title: projectTitle,
        tasks: []
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveProject']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveProject'] = index;
    }
  }
})

.controller('TodoCtrl', function($scope, $timeout, $ionicModal, $ionicSideMenuDelegate, $ionicActionSheet, Projects) {
  // View mode to see all the projects
  $scope.allProjectViewMode = false;

  // Load or initialize projects
  $scope.projects = Projects.all();

  // Grab the last active or the first project
  $scope.activeProject = null;

  // Create and load the Modal for the new task
  $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });

  /************************************************************************************************/
  /*    PROJECTS                                                                                  */
  /************************************************************************************************/
  // Create project
  var createProject = function(projectTitle) {
    var newProject = Projects.newProject(projectTitle);
    $scope.projects.push(newProject);
    Projects.save($scope.projects);
    $scope.selectProject(newProject, $scope.projects.length-1);
  }

  // Edit project
  var editProject = function(project, newTitle) {
    for (var i=0, len=$scope.projects.length; i<len; i+=1) {
      if ($scope.projects[i] == project) {
        $scope.projects[i].title = newTitle;
      }
    }
    Projects.save($scope.projects);
  }

  // Delete project
  var deleteProject = function(project, projectIndex) {
    if (confirm("Veux tu vraiment supprimer " + project.title + " ?")) {
      $scope.projects.splice(projectIndex, 1);
      Projects.save($scope.projects);
      if ($scope.projects.length == 0)
        noProjectsFound();
      else
        $scope.selectProject($scope.projects[0]);
    }
  }

  // called to create a new project
  $scope.newProject = function() {
    var projectTitle = prompt('Nom du projet :');
    if (projectTitle) {
      createProject(projectTitle);
    }
  };

  // Called to select the given project
  $scope.selectProject = function(project, index) {
    $scope.activeProject = project;
    Projects.setLastActiveIndex(index);
    $ionicSideMenuDelegate.toggleLeft(false);
    $scope.allProjectViewMode = false;
  }

  // Select the view mode "all projects"
  $scope.selectAllProjects = function() {
    $ionicSideMenuDelegate.toggleLeft(false);
    $scope.allProjectViewMode = true;
    Projects.setLastActiveIndex(-1); // special index for this view mode
    $scope.activeProject = null;
  }
  
  // Toggle project left menu
  $scope.toggleProjects = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  // Long press project menu
  $scope.onHoldProject = function(project, projectIndex) {
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Modifier' },
        { text: 'Supprimer' }
      ],
      titleText: 'Que veux tu faire de ' + project.title + ' ?',
      buttonClicked: function(index) {
        // Edit
        if (index == 0) {
          var projectTitle = prompt('Nouveau nom du projet :', project.title);
          if (projectTitle) {
            editProject(project, projectTitle);
          }
        }
        else if (index == 1) {
          deleteProject(project, projectIndex);
        }
        return true;
      }
    });
  };

  // Check if there is still one project
  // If not, ask for a name to create one
  var noProjectsFound = function() {
    while(true) {
      var projectTitle = prompt('Bienvenue ! Choisi un nom pour ton premier projet :');
      if (projectTitle) {
        createProject(projectTitle);
        break;
      }
    }
  }

  // First time opening the app
  $timeout(function() {
    if ($scope.projects.length == 0)
      noProjectsFound();
  });


  /************************************************************************************************/
  /*    TASKS                                                                                  */
  /************************************************************************************************/
  // Called when the form is submitted
  $scope.createTask = function(task) {
    if (!$scope.activeProject || !task)
      return;

    $scope.activeProject.tasks.push({
      title: task.title,
      done: false
    });
    $scope.taskModal.hide();

    Projects.save($scope.projects);
    task.title = "";
  };

  // Open our new task modal
  $scope.newTask = function() {
    $scope.taskModal.show();
  };

  // Close the new task modal
  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  };

  // Long press task
  $scope.onClickTask = function(task, taskIndex, project) {
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: "<b>C'est bon, c'est fait !</b>" },
        { text: 'Modifier' },
        { text: 'Supprimer' }
      ],
      titleText: 'Que veux tu faire de ' + task.title + ' ?',
      buttonClicked: function(index) {
        // Task completed
        if (index == 0) {
          task.done = true;
          Projects.save($scope.projects);
        }
        // Edit task
        else if (index == 1) {
          var taskTitle = prompt('Nouveau nom de tâche :', task.title);
          if (taskTitle) {
            task.title = taskTitle;
            Projects.save($scope.projects);
          }
        }
        // Delete task
        else if (index == 2) {
          if (confirm("Veux tu vraiment supprimer cette tâche sans l'avoir accomplie ?"))
            project.tasks.splice(taskIndex, 1);
            Projects.save($scope.projects);
        }
        return true;
      }
    });
  }

  // Delete completed tasks
  $scope.deleteCompletedTasks = function() {
    if (confirm("Veux tu vraiment supprimer les tâches complétées ?")) {
      var indexesToRemove = [];
      for (var i=0, len=$scope.activeProject.tasks.length; i<len; i+=1) {
        if ($scope.activeProject.tasks[i].done) {
          indexesToRemove.push(i);
        }
      }
      for (var i=indexesToRemove.length-1; i>=0; i--) {
        $scope.activeProject.tasks.splice(indexesToRemove[i],1);
      }
      Projects.save($scope.projects);
    }
  }
});