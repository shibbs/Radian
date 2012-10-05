//
//  DataTransmission.m
//  radian
//
//  Created by Rowan Chakoumakos on 9/16/12.
//
//

#import "DataTransmission.h"
#import <AudioToolbox/AudioToolbox.h>



//*************************  BEGIN TONE CODE *************************

#define BUFFER_MULT     50 //slow down from max speed by 100
//#define NUM_BUFFER_BYTES    10   //number of bytes we are sending REDEFINED A COUPLE LINES BELOW
#define TOTAL_BITS_PER_BYTE 10 //8 bits + start bit + stop bit
#define DEAD_BYTES     4    //add some dead byte to end of packet send to clear it out

//beginmarcus
#define SETTINGS_ARRAY_SIZE     5 //the number of settings that we need to transmit
#define NUM_BUFFER_BYTES    (SETTINGS_ARRAY_SIZE+3) //+start flag, end flag, checksum
//endmarcus

#define SEND_BOTH_POLARITIES true //decids whether or not to double the packet and send polarities

#if SEND_BOTH_POLARITIES
#define TOTAL_ARR_SIZE    2*(NUM_BUFFER_BYTES+DEAD_BYTES)*BUFFER_MULT*TOTAL_BITS_PER_BYTE
#else
#define TOTAL_ARR_SIZE    (NUM_BUFFER_BYTES+DEAD_BYTES)*BUFFER_MULT*TOTAL_BITS_PER_BYTE
#endif


// if you want to invert the signal, then change INVERSION_ON to 1 and IDLE_HIGH to 0. if you don't want to invert the signal, then make INVERSION_ON 0 and IDLE_HIGH 1.
#define IDLE_HIGH 1
#define IDLE_HIGH_INVERTED 0
#define INVERSION_ON 1


int bigBuffer[TOTAL_ARR_SIZE] ;



//gets perdiodically called, about every 10ms once the start button is pressed
OSStatus RenderTone(
                    void *inRefCon,
                    AudioUnitRenderActionFlags 	*ioActionFlags,
                    const AudioTimeStamp 		*inTimeStamp,
                    UInt32 						inBusNumber,
                    UInt32 						inNumberFrames,
                    AudioBufferList 			*ioData)

{	// Fixed amplitude is good enough for our purposes
    static int count = 0;
    
	// This is a mono tone generator so we only need the first buffer
	const int channel = 0;
	Float32 *buffer = (Float32 *)ioData->mBuffers[channel].mData;
	
    //  NSLog(@"Thresh is %d",thresh);
	for (UInt32 frame = 0; frame < inNumberFrames; frame++)
	{
        
        buffer[frame] = bigBuffer[count];
        count++;
        //if we are at the end of the array, just fill in 1's to reset the asynch buffer
        if( count > (TOTAL_ARR_SIZE) )
            buffer[frame] = IDLE_HIGH;
        
	}
    //if we're at the end of the buffer, we should refresh
	if( (count ) > TOTAL_ARR_SIZE ) {
        count=0;
        
    }
    
	return noErr;
    
}

@interface DataTransmission (){
    AudioComponentInstance toneUnit;
@public
}
@end



@implementation DataTransmission

/*
 Creates an Asynchronous buffer that gets filled
 */
void CreateSignalArray(int *settings){
    //  NSLog(@"Creating signal, settings are : int_m %d ,int_s %d ,time_hr %d ,time_m %d , n_rot %d ",  settings[0],settings[1],settings[2],settings[3],settings[4]);
    //create a buffer
    int currVal;
    int currByte;
    int buff[NUM_BUFFER_BYTES + DEAD_BYTES];
    int bufferIndex = 0;
    //add 2 preamble dead bytes
    for(bufferIndex = 0; bufferIndex < DEAD_BYTES/2; bufferIndex++){
        buff[bufferIndex] = 0;
    }
    
    buff[bufferIndex++] = 231 ; //this is the first byte we'll send (i.e. the flag byte)
    unsigned char checksum = 0;
    //fill up the rest of the buffer
    int m=0;
    for ( bufferIndex; bufferIndex <= SETTINGS_ARRAY_SIZE + DEAD_BYTES/2 ; bufferIndex++){
        buff[bufferIndex] = settings[m];
        checksum += settings[m];
        m++;
    }
    buff[bufferIndex++] = checksum%230; //insert checksum
    buff[bufferIndex++] = 235; //insert end flag
    //add the dead bytes at the end
    for(bufferIndex; bufferIndex <= NUM_BUFFER_BYTES+ DEAD_BYTES/2; bufferIndex++){
        buff[bufferIndex] = 0;
    }
    
    for(int i =0; i <  bufferIndex; i++){ //loops through each byte
        currByte = buff[i];
        NSLog(@" buffer val %d is %d", i, currByte );
        for(int k=0 ; k<TOTAL_BITS_PER_BYTE ; k++){ //loops through all bits of the byte
            
            if(k > 0 && k < TOTAL_BITS_PER_BYTE-1) currVal = ( currByte & (1<<(k-1 )))>>( k-1) ;
            else if(k == 0) currVal = 0; //start bit is low
            else if(k == TOTAL_BITS_PER_BYTE-1) currVal = 1;//stop bit is high
            
            //for some reason it needs to be inverted on some computers.
            if(INVERSION_ON){
                if(currVal==1) currVal = 0;
                else currVal=1;
            }
            
            for(int j = 0 ; j < BUFFER_MULT   ; j++){ //loops through and fills each bit
                bigBuffer[i*BUFFER_MULT*TOTAL_BITS_PER_BYTE +k*BUFFER_MULT + j] = currVal;
                
            }
        }//end the data part of the byte
    }//end the byte sending
    
    
    //if we are set to send both polarized, then take the data set already created and invert it
    if(SEND_BOTH_POLARITIES){
        int arrSize = TOTAL_ARR_SIZE/2;
        for(int i = 0; i < arrSize; i++){
            if(bigBuffer[i] ==1)
                bigBuffer[i+arrSize] = 0;
            else
                bigBuffer[i+arrSize] = 1;
            
        }
        
        
    }
    
    //    for(int i = 0; i < DEAD_BYTES*TOTAL_BITS_PER_BYTE*BUFFER_MULT; i++)
    //    {
    //        bigBuffer[ NUM_BUFFER_BYTES*TOTAL_BITS_PER_BYTE*BUFFER_MULT + i] = IDLE_HIGH;
    //
    //    }
    
    NSLog(@"Done making buffer Array");
}

- (void)sendSignal:(NSMutableArray*)arguments {
    
    [self createToneUnit];
    
    // Stop changing parameters on the unit
    OSErr err = AudioUnitInitialize(toneUnit);
    NSAssert1(err == noErr, @"Error initializing unit: %ld", err);
    
    // Start playback
    err = AudioOutputUnitStart(toneUnit);
    NSAssert1(err == noErr, @"Error starting unit: %ld", err);
    
    //startMarcus
    int lapseSettings[SETTINGS_ARRAY_SIZE];
  //  createSettingsArray(lapseSettings, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
    //endMarcus
    
    CreateSignalArray(lapseSettings);
}

//startMarcus
//this is an implementation of createSettingsArray() using a standard C array. this is more bare-bones and I could be getting myself into trouble, but it seemed simpler than using the NSObject implementation below.
void createSettingsArray(int *settings,int Interval_m, int Interval_s ,int TotalTime_h, int TotalTime_m, int n_rotations){
    settings[0]=Interval_m;
    settings[1]=Interval_s;
    settings[2]=TotalTime_h;
    settings[3]=TotalTime_m;
    settings[4]=n_rotations;
}


- (void)createToneUnit
{
    NSLog(@"Calling CreatToneUnit");
    //  SteveTestFunc();
    // Configure the search parameters to find the default playback output unit
	// (called the kAudioUnitSubType_RemoteIO on iOS but
	// kAudioUnitSubType_DefaultOutput on Mac OS X)
	AudioComponentDescription defaultOutputDescription;
	defaultOutputDescription.componentType = kAudioUnitType_Output;
	defaultOutputDescription.componentSubType = kAudioUnitSubType_RemoteIO;
	defaultOutputDescription.componentManufacturer = kAudioUnitManufacturer_Apple;
	defaultOutputDescription.componentFlags = 0;
	defaultOutputDescription.componentFlagsMask = 0;
	
	// Get the default playback output unit
	AudioComponent defaultOutput = AudioComponentFindNext(NULL, &defaultOutputDescription);
	NSAssert(defaultOutput, @"Can't find default output");
	
	// Create a new unit based on this that we'll use for output
	OSErr err = AudioComponentInstanceNew(defaultOutput, &toneUnit);
	NSAssert1(toneUnit, @"Error creating unit: %ld", err);
	
	// Set our tone rendering function on the unit
	AURenderCallbackStruct input;
	input.inputProc = RenderTone;
	input.inputProcRefCon = (__bridge void*) self;
	err = AudioUnitSetProperty(toneUnit,
                               kAudioUnitProperty_SetRenderCallback,
                               kAudioUnitScope_Input,
                               0,
                               &input,
                               sizeof(input));
	NSAssert1(err == noErr, @"Error setting callback: %ld", err);
	
	// Set the format to 32 bit, single channel, floating point, linear PCM
	const int four_bytes_per_float = 4;
	const int eight_bits_per_byte = 8;
	AudioStreamBasicDescription streamFormat;
	//streamFormat.mSampleRate = sampleRate;
	streamFormat.mFormatID = kAudioFormatLinearPCM;
	streamFormat.mFormatFlags =
    kAudioFormatFlagsNativeFloatPacked | kAudioFormatFlagIsNonInterleaved;
	streamFormat.mBytesPerPacket = four_bytes_per_float;
	streamFormat.mFramesPerPacket = 1;
	streamFormat.mBytesPerFrame = four_bytes_per_float;
	streamFormat.mChannelsPerFrame = 1;
	streamFormat.mBitsPerChannel = four_bytes_per_float * eight_bits_per_byte;
	err = AudioUnitSetProperty (toneUnit,
                                kAudioUnitProperty_StreamFormat,
                                kAudioUnitScope_Input,
                                0,
                                &streamFormat,
                                sizeof(AudioStreamBasicDescription));
	NSAssert1(err == noErr, @"Error setting stream format: %ld", err);
}
//*************************  END TONE CODE *************************



//self.intervalSettings.minutes, self.intervalSettings.seconds,self.totalTimeSettings.hours, self.totalTimeSettings.minutes,self.rotationsSettings.cw
- (void) send:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    
    //get the callback id
    NSString *callbackId = [arguments pop];
    
    NSString *resultType = [arguments objectAtIndex:0];
    CDVPluginResult *result;
    
    NSLog(@"%u", [arguments count]);
    
    [self sendSignal:arguments];
    
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString: @"Success :)"];
    [self writeJavascript:[result toSuccessCallbackString:callbackId]];
}

@end
