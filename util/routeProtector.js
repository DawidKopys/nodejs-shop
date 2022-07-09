const routeProtector = (protectedRoutes) => {
  return (req, res, next) => {
    const isRouteProtected = protectedRoutes
      .some((route) => req.path.includes(route));

    if (!isRouteProtected) {
      return next();
    }

    if (req.session.isLoggedIn) {
      return next();
    }
    
    return res.redirect('/login');
  }
};

const routeProtector2 = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return next();
  }
  
  return res.redirect('/login');
}

module.exports.routeProtector = routeProtector;
module.exports.routeProtector2 = routeProtector2;