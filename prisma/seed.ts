import { LifecycleStatus, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 清空旧数据（包含之前的扩展数据）
  await prisma.applicationCapability.deleteMany()
  await prisma.applicationTechStack.deleteMany()
  await prisma.applicationTechPlatform.deleteMany()
  await prisma.businessApplication.deleteMany()
  await prisma.businessCapability.deleteMany()
  await prisma.techStack.deleteMany()
  await prisma.techPlatform.deleteMany()

  // 业务能力（有实际含义）
  const capabilities = await prisma.businessCapability.createManyAndReturn({
    data: [
      { name: '客户主数据管理', description: '统一客户档案、分层和标签管理', owner: '客户运营中心', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '线索到商机转化', description: '线索分配、培育、商机推进', owner: '销售管理部', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '报价与合同管理', description: '报价审批、合同模板、签署归档', owner: '销售管理部', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '订单履约协同', description: '订单下发、库存占用、物流协同', owner: '供应链运营部', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '采购与供应商管理', description: '采购申请、询比价、供应商绩效', owner: '采购中心', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '财务总账与应收应付', description: '总账核算、应收应付、关账报表', owner: '财务部', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '预算与经营分析', description: '预算编制、滚动预测、经营看板', owner: '财务BP团队', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '人力资源主数据', description: '组织、岗位、员工主数据维护', owner: '人力资源部', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '招聘与入离职管理', description: '招聘流程、入职手续、离职交接', owner: '人力资源部', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '身份与访问控制', description: '统一认证、角色授权、单点登录', owner: '信息安全部', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: 'API治理与集成编排', description: '系统集成、接口网关、流程编排', owner: '企业架构组', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '数据治理与主数据服务', description: '数据标准、血缘、质量监控', owner: '数据治理委员会', lifecycleStatus: LifecycleStatus.PLANNED },
      { name: '数据仓库与BI报表', description: '主题建模、指标口径、管理驾驶舱', owner: '数据平台团队', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '监控告警与可观测性', description: '日志、指标、链路追踪和告警', owner: 'SRE团队', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '变更发布与配置管理', description: '发布流程、配置审计、回滚机制', owner: '运维平台团队', lifecycleStatus: LifecycleStatus.ACTIVE }
    ]
  })

  // 技术栈（有实际含义）
  const stacks = await prisma.techStack.createManyAndReturn({
    data: [
      { name: 'Next.js', category: 'Frontend', description: '企业门户与管理后台前端框架' },
      { name: 'React', category: 'Frontend', description: '组件化UI开发框架' },
      { name: 'Node.js', category: 'Backend', description: '中台与接口服务运行时' },
      { name: 'NestJS', category: 'Backend', description: '企业级后端服务框架' },
      { name: 'Java Spring Boot', category: 'Backend', description: '核心交易与集成服务框架' },
      { name: 'PostgreSQL', category: 'Database', description: '核心业务关系型数据库' },
      { name: 'MySQL', category: 'Database', description: '运营类业务数据库' },
      { name: 'Redis', category: 'Middleware', description: '缓存、会话与分布式锁' },
      { name: 'Kafka', category: 'Middleware', description: '事件总线与异步消息队列' },
      { name: 'Elasticsearch', category: 'Search', description: '日志检索与全文搜索' },
      { name: 'Airflow', category: 'Data', description: '数据任务编排平台' },
      { name: 'dbt', category: 'Data', description: '数据建模与转换框架' },
      { name: 'Superset', category: 'BI', description: '分析看板与报表可视化' },
      { name: 'Prometheus', category: 'Observability', description: '指标采集与监控' },
      { name: 'Grafana', category: 'Observability', description: '监控看板与告警可视化' }
    ]
  })

  // 技术平台（有实际含义）
  const platforms = await prisma.techPlatform.createManyAndReturn({
    data: [
      { name: 'AWS', vendor: 'Amazon', description: '生产环境主力公有云平台' },
      { name: 'Kubernetes', vendor: 'CNCF', description: '应用容器编排与弹性伸缩平台' },
      { name: 'GitHub Actions', vendor: 'GitHub', description: 'CI/CD流水线平台' },
      { name: 'Auth0', vendor: 'Okta', description: '统一身份认证与授权平台' },
      { name: 'Salesforce', vendor: 'Salesforce', description: '销售与客户管理SaaS平台' },
      { name: 'SAP S/4HANA', vendor: 'SAP', description: '财务与供应链核心ERP平台' },
      { name: 'Snowflake', vendor: 'Snowflake', description: '企业数据仓库与共享平台' },
      { name: 'Datadog', vendor: 'Datadog', description: '应用性能监控与日志分析平台' }
    ]
  })

  // 业务应用（有实际含义）
  const applications = await prisma.businessApplication.createManyAndReturn({
    data: [
      { name: 'CRM 系统', description: '客户管理、线索与商机全流程', owner: '销售管理部', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '订单管理系统 OMS', description: '订单拆分、履约、发货协同', owner: '供应链运营部', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '采购管理系统 P2P', description: '采购申请到付款的闭环管理', owner: '采购中心', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '财务ERP', description: '总账、应收应付、成本核算与报表', owner: '财务部', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: 'HR 人力系统', description: '组织人事、招聘、员工生命周期', owner: '人力资源部', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '统一身份认证平台 IAM', description: 'SSO、MFA与权限治理', owner: '信息安全部', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: 'API 集成平台 ESB', description: '系统间接口集成与编排', owner: '企业架构组', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '数据中台', description: '主数据、数据治理、指标服务', owner: '数据平台团队', lifecycleStatus: LifecycleStatus.PLANNED },
      { name: '经营分析 BI 平台', description: '经营看板、分析报表与决策支持', owner: '财务BP团队', lifecycleStatus: LifecycleStatus.ACTIVE },
      { name: '可观测性平台', description: '统一监控、日志、告警中心', owner: 'SRE团队', lifecycleStatus: LifecycleStatus.ACTIVE }
    ]
  })

  // 建立应用与业务能力关联
  const capByName = new Map(capabilities.map(c => [c.name, c.id]))
  const stackByName = new Map(stacks.map(s => [s.name, s.id]))
  const platformByName = new Map(platforms.map(p => [p.name, p.id]))

  const appByName = new Map(applications.map(a => [a.name, a.id]))

  const linkCapabilities: Array<{ applicationId: string; capabilityId: string }> = [
    ['CRM 系统', '客户主数据管理'],
    ['CRM 系统', '线索到商机转化'],
    ['CRM 系统', '报价与合同管理'],

    ['订单管理系统 OMS', '订单履约协同'],
    ['订单管理系统 OMS', 'API治理与集成编排'],

    ['采购管理系统 P2P', '采购与供应商管理'],
    ['采购管理系统 P2P', '财务总账与应收应付'],

    ['财务ERP', '财务总账与应收应付'],
    ['财务ERP', '预算与经营分析'],

    ['HR 人力系统', '人力资源主数据'],
    ['HR 人力系统', '招聘与入离职管理'],

    ['统一身份认证平台 IAM', '身份与访问控制'],

    ['API 集成平台 ESB', 'API治理与集成编排'],

    ['数据中台', '数据治理与主数据服务'],
    ['数据中台', '数据仓库与BI报表'],

    ['经营分析 BI 平台', '预算与经营分析'],
    ['经营分析 BI 平台', '数据仓库与BI报表'],

    ['可观测性平台', '监控告警与可观测性'],
    ['可观测性平台', '变更发布与配置管理']
  ].map(([app, cap]) => ({ applicationId: appByName.get(app)!, capabilityId: capByName.get(cap)! }))

  await prisma.applicationCapability.createMany({ data: linkCapabilities })

  // 建立应用与技术栈关联
  const linkStacks: Array<{ applicationId: string; stackId: string }> = [
    ['CRM 系统', 'React'],
    ['CRM 系统', 'Node.js'],
    ['CRM 系统', 'PostgreSQL'],

    ['订单管理系统 OMS', 'Java Spring Boot'],
    ['订单管理系统 OMS', 'Kafka'],
    ['订单管理系统 OMS', 'MySQL'],

    ['采购管理系统 P2P', 'NestJS'],
    ['采购管理系统 P2P', 'PostgreSQL'],

    ['财务ERP', 'Java Spring Boot'],
    ['财务ERP', 'PostgreSQL'],

    ['HR 人力系统', 'Next.js'],
    ['HR 人力系统', 'Node.js'],
    ['HR 人力系统', 'PostgreSQL'],

    ['统一身份认证平台 IAM', 'NestJS'],
    ['统一身份认证平台 IAM', 'Redis'],

    ['API 集成平台 ESB', 'Java Spring Boot'],
    ['API 集成平台 ESB', 'Kafka'],

    ['数据中台', 'Airflow'],
    ['数据中台', 'dbt'],
    ['数据中台', 'PostgreSQL'],

    ['经营分析 BI 平台', 'Superset'],
    ['经营分析 BI 平台', 'PostgreSQL'],

    ['可观测性平台', 'Prometheus'],
    ['可观测性平台', 'Grafana'],
    ['可观测性平台', 'Elasticsearch']
  ].map(([app, stack]) => ({ applicationId: appByName.get(app)!, stackId: stackByName.get(stack)! }))

  await prisma.applicationTechStack.createMany({ data: linkStacks })

  // 建立应用与技术平台关联
  const linkPlatforms: Array<{ applicationId: string; platformId: string }> = [
    ['CRM 系统', 'Salesforce'],
    ['CRM 系统', 'AWS'],

    ['订单管理系统 OMS', 'AWS'],
    ['订单管理系统 OMS', 'Kubernetes'],

    ['采购管理系统 P2P', 'AWS'],

    ['财务ERP', 'SAP S/4HANA'],

    ['HR 人力系统', 'AWS'],

    ['统一身份认证平台 IAM', 'Auth0'],

    ['API 集成平台 ESB', 'Kubernetes'],

    ['数据中台', 'Snowflake'],

    ['经营分析 BI 平台', 'Snowflake'],

    ['可观测性平台', 'Datadog']
  ].map(([app, platform]) => ({ applicationId: appByName.get(app)!, platformId: platformByName.get(platform)! }))

  await prisma.applicationTechPlatform.createMany({ data: linkPlatforms })

  console.log('Seed completed with meaningful enterprise architecture demo data')
}

main().finally(async () => {
  await prisma.$disconnect()
})
