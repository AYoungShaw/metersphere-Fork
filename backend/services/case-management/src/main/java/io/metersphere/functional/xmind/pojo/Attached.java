
package io.metersphere.functional.xmind.pojo;

import lombok.Data;

import java.util.List;

/**
 * XMind 节点对象
 */
@Data
public class Attached {

	private String id;
	private String title;
	private Notes notes;
	private String path;
	private Attached parent;
	private List<Comments> comments;
	private Children children;

}
