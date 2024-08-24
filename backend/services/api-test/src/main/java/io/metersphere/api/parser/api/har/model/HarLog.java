/**
 * har - HAR file reader, writer and viewer
 * Copyright (c) 2014, Sandeep Gupta
 * <p>
 * http://sangupta.com/projects/har
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.metersphere.api.parser.api.har.model;

import java.util.List;

public class HarLog {

    public static final String DEFAULT_HAR_VERSION = "1.2";

    public String version = DEFAULT_HAR_VERSION;

    public HarCreator creator;

    public HarCreator browser;

    public List<HarPage> pages;

    public List<HarEntry> entries;

    public String comment;

    @Override
    public String toString() {
        return "HarLog [version=" + version + ", creator=" + creator + ", browser=" + browser + ", pages=" + pages
                + ", entries=" + entries + ", comment=" + comment + "]";
    }


}
