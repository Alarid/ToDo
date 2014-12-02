// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('todo', ['ionic'])

.factory('Projects', function() {
  return {
    all: function() {
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

  // Load or initialize projects
  $scope.projects = Projects.all();

  // Grab the last active or the first project
  $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

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
  }

  // Create and load the Modal
  $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });

  // Called when the form is submitted
  $scope.createTask = function(task) {
    if (!$scope.activeProject || !task)
      return;

    $scope.activeProject.tasks.push({
      title: task.title
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

  $scope.toggleProjects = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  // Long press project menu
  $scope.onHold = function(project) {
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Modifier' },
        { text: 'Supprimer' }
      ],
      titleText: 'Que voulez vous faire de ' + project.title + ' ?',
      buttonClicked: function(index) {
        // Edit
        if (index == 0) {
          var projectTitle = prompt('Nouveau nom du projet :');
          if (projectTitle) {
            editProject(project, projectTitle);
          }
        }
        else if (index == 1) {
          // TODO
        }
        return true;
      }
    });
  };

  $timeout(function() {
    if ($scope.projects.length == 0) {
      while(true) {
        var projectTitle = prompt('Bienvenue ! Choisissez un nom pour votre premier projet :');
        if (projectTitle) {
          createProject(projectTitle);
          break;
        }
      }
    }
  });

});