//
//  DataTransmission.h
//  radian
//
//  Created by Rowan Chakoumakos on 9/16/12.
//
//

#import <Cordova/CDVPlugin.h>

@interface DataTransmission : CDVPlugin

- (void) send:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end