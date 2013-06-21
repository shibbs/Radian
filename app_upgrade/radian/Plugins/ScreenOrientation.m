//
//  ScreenOrientation.m
//
//  Created by Simon Cruise on 30/08/2012.
//

#import "ScreenOrientation.h"
#import "MainViewController.h"

@implementation ScreenOrientation

- (void)set:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
{
    AppDelegate* appDelegate = (AppDelegate*) [UIApplication sharedApplication].delegate;
    NSLog(@"test test");
    NSMutableArray *allowed = [NSMutableArray array];
    NSString *targetOrientation = [options objectForKey:@"key"];
    int statusBarHeight = [[UIApplication sharedApplication] statusBarFrame].size.height;
    int statusBarWidth = [[UIApplication sharedApplication] statusBarFrame].size.width;
    
    if([targetOrientation isEqualToString:@"landscape"]) {
        MainViewController * mv = (MainViewController *) appDelegate.viewController;
        mv.allowedOrientationsMask = UIInterfaceOrientationMaskLandscape;
        [allowed addObject:[NSNumber numberWithInt:UIDeviceOrientationLandscapeRight]];
        [allowed addObject:[NSNumber numberWithInt:UIDeviceOrientationLandscapeLeft]];
        mv.allowedOrientations = allowed;
        
        UIViewController *portraitViewController = [[UIViewController alloc] init];
        UINavigationController* nc = [[UINavigationController alloc] initWithRootViewController:portraitViewController];
        [mv presentModalViewController:nc animated:NO];
        [mv dismissModalViewControllerAnimated:NO];
        /*
         [[UIApplication sharedApplication] setStatusBarOrientation:UIDeviceOrientationLandscapeRight animated:YES];
         [appDelegate.viewController.view setTransform: CGAffineTransformMakeRotation(M_PI * 1.5)];
         [appDelegate.viewController.view setFrame:CGRectMake(statusBarHeight, 0, appDelegate.viewController.view.frame.size.height-statusBarHeight, appDelegate.viewController.view.frame.size.width+statusBarHeight)];
         
         [UIView commitAnimations];*/
    }
    if([targetOrientation isEqualToString:@"portrait"]) {
        MainViewController * mv = (MainViewController *) appDelegate.viewController;
        if (![mv.allowedOrientations containsObject:[NSNumber numberWithInt:UIDeviceOrientationPortrait]]) {
            [[UIApplication sharedApplication] setStatusBarOrientation:UIDeviceOrientationPortrait animated:YES];
            [appDelegate.viewController.view setTransform: CGAffineTransformMakeRotation(0)];
            [appDelegate.viewController.view setFrame:CGRectMake(0, statusBarWidth, appDelegate.viewController.view.frame.size.height+statusBarWidth, appDelegate.viewController.view.frame.size.width-statusBarWidth)];
            
            [UIView commitAnimations];
            
            mv.allowedOrientationsMask = UIInterfaceOrientationMaskPortrait;
            [allowed addObject:[NSNumber numberWithInt:UIDeviceOrientationPortrait]];
            mv.allowedOrientations = allowed;
            
            
            UIViewController *portraitViewController = [[UIViewController alloc] init];
            portraitViewController.view.backgroundColor = [UIColor redColor];
            UINavigationController* nc = [[UINavigationController alloc] initWithRootViewController:portraitViewController];
            [mv presentModalViewController:nc animated:NO];
            [mv dismissModalViewControllerAnimated:NO];
            
            /*
             
             */
            
            
        }
    }
    
}


@end