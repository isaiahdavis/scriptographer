/*
 * Scriptographer
 *
 * This file is part of Scriptographer, a Plugin for Adobe Illustrator.
 *
 * Copyright (c) 2002-2005 Juerg Lehni, http://www.scratchdisk.com.
 * All rights reserved.
 *
 * Please visit http://scriptographer.com/ for updates and contact.
 *
 * -- GPL LICENSE NOTICE --
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
 * -- GPL LICENSE NOTICE --
 *
 * $RCSfile: exceptions.cpp,v $
 * $Author: lehni $
 * $Revision: 1.2 $
 * $Date: 2005/03/05 21:39:40 $
 */
 
#include "stdHeaders.h"
#include "Plugin.h"
#include "ScriptographerEngine.h"
#include "consoleDialog.h"

void Exception::convert(JNIEnv *env) {
}

void Exception::report(JNIEnv *env) {
	if (gPlugin != NULL)
		gPlugin->reportError("Unknown Error");
}

void StringException::convert(JNIEnv *env) {
	gEngine->throwException(env, fMessage);
}

void StringException::report(JNIEnv *env) {
	if (gPlugin != NULL)
		gPlugin->reportError(fMessage);
}

void ASErrException::convert(JNIEnv *env) {
	// TODO: declare this
}

void ASErrException::report(JNIEnv *env) {
	if (gPlugin != NULL)
		gPlugin->reportError("ASErrException %i\n", fError);
}

void JThrowableException::convert(JNIEnv *env) {
	env->Throw(fThrowable);
	env->DeleteLocalRef(fThrowable);
}

void JThrowableException::report(JNIEnv *env) {
	// we don't depend on any underlaying structures like gEngine here, so all the classes need
	// to be loaded first:
	jclass cls_StringWriter = env->FindClass("java/io/StringWriter");
	jmethodID ctr_StringWriter = env->GetMethodID(cls_StringWriter, "<init>", "()V");
	jmethodID mid_toString = env->GetMethodID(cls_StringWriter, "toString", "()Ljava/lang/String;");

	jclass cls_PrintWriter = env->FindClass("java/io/PrintWriter");
	jmethodID ctr_PrintWriter = env->GetMethodID(cls_PrintWriter, "<init>", "(Ljava/io/Writer;)V");

	jclass cls_Throwable = env->FindClass("java/lang/Throwable");
	jmethodID mid_printStackTrace = env->GetMethodID(cls_Throwable, "printStackTrace", "(Ljava/io/PrintWriter;)V");

	jclass cls_String = env->FindClass("java/lang/String");
	jmethodID mid_getBytes = env->GetMethodID(cls_String, "getBytes", "()[B");
	if (env->ExceptionCheck()) {
		env->ExceptionDescribe();
	} else {
		// create the string writer...
		jobject writer = env->NewObject(cls_StringWriter, ctr_StringWriter);
		// ...wrap it in a PrintWriter
		jobject printer = env->NewObject(cls_PrintWriter, ctr_PrintWriter, writer);
		// and print the stacktrace to it.
		env->CallVoidMethod(fThrowable, mid_printStackTrace, printer);
		// now fetch the string:
		jstring jstr = (jstring)env->CallObjectMethod(writer, mid_toString);
		// create a c-string from it:
		jbyteArray bytes = (jbyteArray)env->CallObjectMethod(jstr, mid_getBytes);
		jint len = env->GetArrayLength(bytes);
		char *str = new char[len + 1];
		if (str == NULL) {
			env->DeleteLocalRef(bytes);
		} else {
			env->GetByteArrayRegion(bytes, 0, len, (jbyte *)str);
			str[len] = 0; // NULL-terminate
			env->DeleteLocalRef(bytes);
			/*
#ifdef MAC_ENV
			// convert line breaks on mac:
			for (int i = 0; i < len; i++) {
				if (str[i] == '\r') str[i] = '\n';
			}
#endif
			*/
			if (gPlugin != NULL)
				consoleShowText(str);
				// gPlugin->reportError("JThrowableException %s\n", str);
			delete str;
		}
	}
}

void JThrowableClassException::convert(JNIEnv *env) {
	env->ThrowNew(fClass, NULL);
}

void JThrowableClassException::report(JNIEnv *env) {
	gPlugin->reportError("JThrowableClassException %i\n", fClass);
}