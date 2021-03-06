angular.module('starter.controllers', [])

.controller('SketchCtrl', function($scope, $rootScope, $state) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.goToDraw = function (name) {

    $rootScope.name = name;

    // Go To the Draw Page
    $state.go('draw');
  };
})

.controller('ImageCtrl', function($scope, $rootScope, $state, $http) {

  $scope.submitPhoto = function (name) {

    var filesSelected = document.getElementById("upload").files;
    if (filesSelected.length > 0)  {
        var fileToLoad = filesSelected[0];
        var fileReader = new FileReader();

        fileReader.onload = function(fileLoadedEvent)  {
            //var textAreaFileContents = document.getElementById("textAreaFileContents");
            //textAreaFileContents.innerHTML = fileLoadedEvent.target.result;
            //console.log(fileLoadedEvent.target.result)

		    // Submit to container then on success go to the List Page
		    $http({
		      method: 'POST'
		    , url: '/api/sketch/1?type=jpeg&name=' + document.getElementById("name").value
		    , headers: {'Content-Type': 'image/jpeg'}
		    , transformRequest: angular.identity
		    , data: fileLoadedEvent.target.result
		    }).success(function (data) {
		      console.log('success. data:', data);
		      // Need the container link
		      var items = localStorage.getItem('keynote2015-mobile-app');
		
		      if (!items) {
		        items = {containers: []};
		      }
		
		      try {
		        items = JSON.parse(items);
		      } catch (err) {
		        items = {containers: []};
		      }
		
		      items.containers.push({
		        img: fileLoadedEvent.target.result, 
                sketch: data
		      });
		
		      items = JSON.stringify(items);
		
		      // Save to the local storage
		      localStorage.setItem('keynote2015-mobile-app', items);
		      $state.go('list');
		    });
        };
    
        fileReader.readAsDataURL(fileToLoad);
    }


  };
})


.controller('ListCtrl', function($scope) {
  $scope.$on('$ionicView.enter', function(e) {
    var items = localStorage.getItem('keynote2015-mobile-app');
    try {
      items = JSON.parse(items);
    } catch (err) {
      items = {containers: []};
    }
    $scope.containers = items.containers; });
})


.controller('DrawCtrl', function ($scope, $rootScope, $state, $http) {
  $scope.$on('$ionicView.enter', function(e) {
    if ('ontouchstart' in window) {
    /* browser with Touch Events
       running on touch-capable device */
       $scope.super_awesome_multitouch_drawing_canvas_thingy = new CanvasDrawr({id:"example", size: 15 });
    } else {
      $scope.super_awesome_multitouch_drawing_canvas_thingy = new CanvasDrawrMouse({id:"example", size: 15 });
    }
    var canvas = document.querySelector('canvas'),
      ctx = canvas.getContext("2d");

    $scope.backAndClear = function () {
      ctx.clearRect(0,0, document.width, document.height);
    };

    $scope.submitToContainer = function () {
      // Submit to container then on success go to the List Page
      $http({
        method: 'POST'
      , url: '/api/sketch/1?type=png&name=' + $rootScope.name
      , headers: {'Content-Type': 'image/png'}
      , transformRequest: angular.identity
      , data: canvas.toDataURL()
      }).success(function (data) {
        console.log('success. data:', data);
        // Need the container link
        var items = localStorage.getItem('keynote2015-mobile-app');

        if (!items) {
          items = {containers: []};
        }

        try {
          items = JSON.parse(items);
        } catch (err) {
          items = {containers: []};
        }

        items.containers.push({
          img: canvas.toDataURL()
        , sketch: data
        });

        items = JSON.stringify(items);

        // Save to the local storage
        localStorage.setItem('keynote2015-mobile-app', items);
        $state.go('list');
      });
    };

  });
});
