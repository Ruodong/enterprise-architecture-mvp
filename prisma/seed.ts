import { LifecycleStatus, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.applicationCapability.deleteMany()
  await prisma.applicationTechStack.deleteMany()
  await prisma.applicationTechPlatform.deleteMany()
  await prisma.businessApplication.deleteMany()
  await prisma.businessCapability.deleteMany()
  await prisma.techStack.deleteMany()
  await prisma.techPlatform.deleteMany()

  const capabilityDefs = [
    { name: '市场与销售管理', level: 1, owner: '销售管理部' },
    { name: '供应链与履约管理', level: 1, owner: '供应链运营部' },
    { name: '财务与经营管理', level: 1, owner: '财务部' },
    { name: '人力与组织管理', level: 1, owner: '人力资源部' },
    { name: '企业平台与治理', level: 1, owner: '企业架构组' },

    { name: '客户经营', level: 2, parent: '市场与销售管理', owner: '客户运营中心' },
    { name: '交易管理', level: 2, parent: '市场与销售管理', owner: '销售管理部' },
    { name: '采购与供应商协同', level: 2, parent: '供应链与履约管理', owner: '采购中心' },
    { name: '订单履约', level: 2, parent: '供应链与履约管理', owner: '供应链运营部' },
    { name: '核算与经营分析', level: 2, parent: '财务与经营管理', owner: '财务BP团队' },
    { name: '组织人事管理', level: 2, parent: '人力与组织管理', owner: '人力资源部' },
    { name: '集成与数据治理', level: 2, parent: '企业平台与治理', owner: '数据平台团队' },
    { name: '安全与运维保障', level: 2, parent: '企业平台与治理', owner: '信息安全部' },

    { name: '客户主数据管理', level: 3, parent: '客户经营', owner: '客户运营中心' },
    { name: '线索到商机转化', level: 3, parent: '交易管理', owner: '销售管理部' },
    { name: '报价与合同管理', level: 3, parent: '交易管理', owner: '销售管理部' },
    { name: '采购与供应商管理', level: 3, parent: '采购与供应商协同', owner: '采购中心' },
    { name: '订单履约协同', level: 3, parent: '订单履约', owner: '供应链运营部' },
    { name: '财务总账与应收应付', level: 3, parent: '核算与经营分析', owner: '财务部' },
    { name: '预算与经营分析', level: 3, parent: '核算与经营分析', owner: '财务BP团队' },
    { name: '人力资源主数据', level: 3, parent: '组织人事管理', owner: '人力资源部' },
    { name: '招聘与入离职管理', level: 3, parent: '组织人事管理', owner: '人力资源部' },
    { name: 'API治理与集成编排', level: 3, parent: '集成与数据治理', owner: '企业架构组' },
    { name: '数据治理与主数据服务', level: 3, parent: '集成与数据治理', owner: '数据治理委员会' },
    { name: '数据仓库与BI报表', level: 3, parent: '集成与数据治理', owner: '数据平台团队' },
    { name: '身份与访问控制', level: 3, parent: '安全与运维保障', owner: '信息安全部' },
    { name: '监控告警与可观测性', level: 3, parent: '安全与运维保障', owner: 'SRE团队' },
    { name: '变更发布与配置管理', level: 3, parent: '安全与运维保障', owner: '运维平台团队' }
  ] as const

  const capMap = new Map<string, string>()
  for (const def of capabilityDefs.filter((x) => x.level === 1)) {
    const c = await prisma.businessCapability.create({
      data: {
        name: def.name,
        level: def.level,
        owner: def.owner,
        description: `${def.name}（L1）`,
        lifecycleStatus: LifecycleStatus.ACTIVE
      }
    })
    capMap.set(def.name, c.id)
  }

  for (const def of capabilityDefs.filter((x) => x.level !== 1)) {
    const c = await prisma.businessCapability.create({
      data: {
        name: def.name,
        level: def.level,
        parentId: def.parent ? capMap.get(def.parent)! : null,
        owner: def.owner,
        description: `${def.name}（L${def.level}）`,
        lifecycleStatus: def.name === '数据治理与主数据服务' ? LifecycleStatus.PLANNED : LifecycleStatus.ACTIVE
      }
    })
    capMap.set(def.name, c.id)
  }

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

  const appByName = new Map(applications.map((a) => [a.name, a.id]))
  const stackByName = new Map(stacks.map((s) => [s.name, s.id]))
  const platformByName = new Map(platforms.map((p) => [p.name, p.id]))

  const linkCapabilities: Array<{ applicationId: string; capabilityId: string }> = [
    ['CRM 系统', '客户经营'],
    ['CRM 系统', '客户主数据管理'],
    ['CRM 系统', '线索到商机转化'],
    ['CRM 系统', '报价与合同管理'],

    ['订单管理系统 OMS', '订单履约'],
    ['订单管理系统 OMS', '订单履约协同'],

    ['采购管理系统 P2P', '采购与供应商协同'],
    ['采购管理系统 P2P', '采购与供应商管理'],

    ['财务ERP', '核算与经营分析'],
    ['财务ERP', '财务总账与应收应付'],

    ['HR 人力系统', '组织人事管理'],
    ['HR 人力系统', '人力资源主数据'],
    ['HR 人力系统', '招聘与入离职管理'],

    ['统一身份认证平台 IAM', '安全与运维保障'],
    ['统一身份认证平台 IAM', '身份与访问控制'],

    ['API 集成平台 ESB', '集成与数据治理'],
    ['API 集成平台 ESB', 'API治理与集成编排'],

    ['数据中台', '企业平台与治理'],
    ['数据中台', '集成与数据治理'],
    ['数据中台', '数据治理与主数据服务'],
    ['数据中台', '数据仓库与BI报表'],

    ['经营分析 BI 平台', '财务与经营管理'],
    ['经营分析 BI 平台', '预算与经营分析'],
    ['经营分析 BI 平台', '数据仓库与BI报表'],

    ['可观测性平台', '安全与运维保障'],
    ['可观测性平台', '监控告警与可观测性'],
    ['可观测性平台', '变更发布与配置管理']
  ].map(([app, cap]) => ({ applicationId: appByName.get(app)!, capabilityId: capMap.get(cap)! }))

  await prisma.applicationCapability.createMany({ data: linkCapabilities })

  const linkStacks: Array<{ applicationId: string; stackId: string }> = [
    ['CRM 系统', 'React'], ['CRM 系统', 'Node.js'], ['CRM 系统', 'PostgreSQL'],
    ['订单管理系统 OMS', 'Java Spring Boot'], ['订单管理系统 OMS', 'Kafka'], ['订单管理系统 OMS', 'MySQL'],
    ['采购管理系统 P2P', 'NestJS'], ['采购管理系统 P2P', 'PostgreSQL'],
    ['财务ERP', 'Java Spring Boot'], ['财务ERP', 'PostgreSQL'],
    ['HR 人力系统', 'Next.js'], ['HR 人力系统', 'Node.js'], ['HR 人力系统', 'PostgreSQL'],
    ['统一身份认证平台 IAM', 'NestJS'], ['统一身份认证平台 IAM', 'Redis'],
    ['API 集成平台 ESB', 'Java Spring Boot'], ['API 集成平台 ESB', 'Kafka'],
    ['数据中台', 'Airflow'], ['数据中台', 'dbt'], ['数据中台', 'PostgreSQL'],
    ['经营分析 BI 平台', 'Superset'], ['经营分析 BI 平台', 'PostgreSQL'],
    ['可观测性平台', 'Prometheus'], ['可观测性平台', 'Grafana'], ['可观测性平台', 'Elasticsearch']
  ].map(([app, stack]) => ({ applicationId: appByName.get(app)!, stackId: stackByName.get(stack)! }))

  await prisma.applicationTechStack.createMany({ data: linkStacks })

  const linkPlatforms: Array<{ applicationId: string; platformId: string }> = [
    ['CRM 系统', 'Salesforce'], ['CRM 系统', 'AWS'],
    ['订单管理系统 OMS', 'AWS'], ['订单管理系统 OMS', 'Kubernetes'],
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

  console.log('Seed completed with 3-level capabilities and cross-level app links')
}

main().finally(async () => {
  await prisma.$disconnect()
})
